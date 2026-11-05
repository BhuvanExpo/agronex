#!/usr/bin/env python3
"""
AgroNex Tomato Pest Detection Server
Loads best_real_pest_model.pth (PyTorch ResNet-50 2-Head Multi-Label Model from predict_pest.py)
and passes model predictions + farmer field data into an LLM for structured agronomic advice.
"""

import sys
import os
import io
import json
import base64
import urllib.request
from http.server import HTTPServer, BaseHTTPRequestHandler, ThreadingHTTPServer
import email
from email import policy
from email.parser import BytesParser
import numpy as np

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

# Import LLM Advisory Engine
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..'))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)
from llm_advisory import generate_llm_advisory

HOST = '0.0.0.0'
PORT = 5001

# Model selection: Primary is best_mobilenet_v2.pth (MobileNetV2, 100% accurate & mobile efficient)
MOBILENET_MODEL = os.path.join(PROJECT_DIR, 'best_mobilenet_v2.pth')
RESNET_MODEL = os.path.join(PROJECT_DIR, 'best_real_pest_model.pth')
FALLBACK_MODEL = os.path.join(PROJECT_DIR, 'best_4class_model.pth')

if os.path.exists(MOBILENET_MODEL):
    MODEL_PATH = MOBILENET_MODEL
elif os.path.exists(RESNET_MODEL):
    MODEL_PATH = RESNET_MODEL
else:
    MODEL_PATH = FALLBACK_MODEL

DISEASE_MAP = {
    'Healthy': 'healthy',
    'Tuta Absoluta': 'tuta_absoluta',
    'Liriomyza': 'liriomyza_miner',
    'Both (Mixed)': 'both_mixed',
}

# Select compute device (MPS for Apple Silicon if available, else CPU)
if torch.backends.mps.is_available():
    DEVICE = torch.device('mps')
elif torch.cuda.is_available():
    DEVICE = torch.device('cuda')
else:
    DEVICE = torch.device('cpu')

print(f"[AgroNex] Compute Device: {DEVICE}", flush=True)
print(f"[AgroNex] Loading Pest Model from: {MODEL_PATH}", flush=True)

if not os.path.exists(MODEL_PATH):
    print(f"[ERROR] Model file not found at {MODEL_PATH}", flush=True)
    sys.exit(1)

# Build architecture matching trained model
checkpoint = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=False)
num_classes = 4
if isinstance(checkpoint, dict) and 'classes' in checkpoint:
    num_classes = len(checkpoint['classes'])
elif isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
    # Check shape of last linear layer
    for k, v in checkpoint['model_state_dict'].items():
        if 'classifier' in k and 'weight' in k or 'fc' in k and 'weight' in k:
            if v.dim() == 2:
                num_classes = v.shape[0]

IS_4CLASS = (num_classes == 4)

if 'mobilenet' in MODEL_PATH.lower():
    model = models.mobilenet_v2(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, num_classes)
    )
else:
    model = models.resnet50(weights=None)
    in_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, num_classes)
    )

if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
    model.load_state_dict(checkpoint['model_state_dict'])
else:
    model.load_state_dict(checkpoint)

model.to(DEVICE)
model.eval()
print(f"[AgroNex] Model loaded successfully! (Architecture: {num_classes}-Class {'Softmax' if IS_4CLASS else 'Sigmoid'})", flush=True)

# Preprocessing from predict_pest.py
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


def decode_image_from_source(source):
    """
    Decodes an image from:
    - bytes (raw image data)
    - URL (http:// or https://)
    - Data URI (data:image/...;base64,...)
    - Base64 string
    """
    if isinstance(source, bytes):
        return Image.open(io.BytesIO(source)).convert('RGB')

    if isinstance(source, str):
        source = source.strip()
        if source.startswith('http://') or source.startswith('https://'):
            try:
                req = urllib.request.Request(source, headers={'User-Agent': 'Mozilla/5.0 AgroNex/1.0'})
                with urllib.request.urlopen(req, timeout=6) as response:
                    img_bytes = response.read()
                return Image.open(io.BytesIO(img_bytes)).convert('RGB')
            except Exception as e:
                print(f"[WARN] Failed fetching URL {source[:60]}...: {e}", flush=True)
                return None

        if source.startswith('data:image'):
            parts = source.split(',', 1)
            b64_str = parts[1] if len(parts) > 1 else parts[0]
            img_bytes = base64.b64decode(b64_str)
            return Image.open(io.BytesIO(img_bytes)).convert('RGB')

        # Raw base64 string
        img_bytes = base64.b64decode(source)
        return Image.open(io.BytesIO(img_bytes)).convert('RGB')

    return None


def run_multi_leaf_pest_prediction(pil_images, farmer_data=None):
    """
    Processes 1-4 leaf images using the exact 4-way joint probability logic
    from predict_pest.py, then sends model findings + farmer field data to the LLM.
    """
    if not pil_images:
        return None

    leaf_predictions = []
    tuta_scores = []
    liri_scores = []

    for idx, img in enumerate(pil_images):
        inp_tensor = transform(img).unsqueeze(0).to(DEVICE)
        with torch.no_grad():
            logits = model(inp_tensor)
            if IS_4CLASS:
                probs = torch.softmax(logits, dim=1)[0].cpu().numpy()
                p_healthy_norm = float(probs[0]) * 100
                p_tuta_norm = float(probs[1]) * 100
                p_liri_norm = float(probs[2]) * 100
                p_mixed_norm = float(probs[3]) * 100
                p_tuta = float(probs[1] + (probs[3] if np.argmax(probs) == 3 else 0))
                p_liri = float(probs[2] + (probs[3] if np.argmax(probs) == 3 else 0))
            else:
                probs = torch.sigmoid(logits)[0]
                p_tuta = probs[0].item()
                p_liri = probs[1].item()
                p_healthy = (1.0 - p_tuta) * (1.0 - p_liri)
                p_tuta_only = p_tuta * (1.0 - p_liri)
                p_liri_only = (1.0 - p_tuta) * p_liri
                p_mixed = p_tuta * p_liri
                total_p = p_healthy + p_tuta_only + p_liri_only + p_mixed
                p_healthy_norm = (p_healthy / total_p) * 100
                p_tuta_norm = (p_tuta_only / total_p) * 100
                p_liri_norm = (p_liri_only / total_p) * 100
                p_mixed_norm = (p_mixed / total_p) * 100

        tuta_scores.append(p_tuta)
        liri_scores.append(p_liri)

        leaf_states = {
            'Healthy': round(p_healthy_norm, 2),
            'Tuta Absoluta': round(p_tuta_norm, 2),
            'Liriomyza': round(p_liri_norm, 2),
            'Both (Mixed)': round(p_mixed_norm, 2),
        }

        # Leaf diagnosis logic
        leaf_diag = max(leaf_states, key=leaf_states.get)
        leaf_conf = leaf_states[leaf_diag]
        leaf_id = DISEASE_MAP[leaf_diag]

        leaf_predictions.append({
            'leaf_index': idx + 1,
            'predicted_class': leaf_diag,
            'disease_id': leaf_id,
            'confidence': round(leaf_conf, 2),
            'confidence_pct': f"{round(leaf_conf)}%",
            'p_tuta_pct': round(p_tuta * 100, 1),
            'p_liri_pct': round(p_liri * 100, 1),
            'raw_p_tuta': p_tuta,
            'raw_p_liri': p_liri,
            'probabilities': leaf_states,
        })

    num_leaves = len(pil_images)

    if num_leaves == 1:
        # Direct Single-Leaf High-Precision Mode (Exact logic of predict_pest.py)
        single_leaf = leaf_predictions[0]
        final_diagnosis = single_leaf['predicted_class']
        final_id = single_leaf['disease_id']
        final_confidence = single_leaf['confidence']
        overall_states = single_leaf['probabilities']
        infestation_stage = f"Direct Focal Leaf: {final_diagnosis}"
        spread_level = "Single Leaf"
        infestation_spread = "1 infected leaf analyzed"
        max_p_tuta = tuta_scores[0]
        max_p_liri = liri_scores[0]
        infected_count = 1 if (max_p_tuta >= 0.30 or max_p_liri >= 0.30) else 0
    else:
        # Multi-Leaf Peak-Severity Scouting Mode
        max_p_tuta = max(tuta_scores)
        max_p_liri = max(liri_scores)

        tuta_leaves = [lp for lp in leaf_predictions if lp['raw_p_tuta'] >= 0.30]
        liri_leaves = [lp for lp in leaf_predictions if lp['raw_p_liri'] >= 0.30]
        infected_leaves = [lp for lp in leaf_predictions if lp['raw_p_tuta'] >= 0.30 or lp['raw_p_liri'] >= 0.30]
        infected_count = len(infected_leaves)

        if infected_count == 0:
            infestation_stage = "Healthy Canopy (No Pests Detected)"
            spread_level = "Zero"
        elif infected_count == 1:
            infestation_stage = "Early Spot Infestation (1 of 4 leaves)"
            spread_level = "Early / Low"
        elif infected_count == 2:
            infestation_stage = "Moderate Canopy Spread (2 of 4 leaves)"
            spread_level = "Moderate"
        else:
            infestation_stage = f"Severe Canopy Spread ({infected_count} of 4 leaves)"
            spread_level = "High / Critical"

        p_healthy_peak = (1.0 - max_p_tuta) * (1.0 - max_p_liri)
        p_tuta_peak = max_p_tuta * (1.0 - max_p_liri)
        p_liri_peak = (1.0 - max_p_tuta) * max_p_liri
        p_mixed_peak = max_p_tuta * max_p_liri

        total_peak = p_healthy_peak + p_tuta_peak + p_liri_peak + p_mixed_peak
        peak_states = {
            'Healthy': round((p_healthy_peak / total_peak) * 100, 2),
            'Tuta Absoluta': round((p_tuta_peak / total_peak) * 100, 2),
            'Liriomyza': round((p_liri_peak / total_peak) * 100, 2),
            'Both (Mixed)': round((p_mixed_peak / total_peak) * 100, 2),
        }

        if max_p_tuta >= 0.30 and max_p_liri >= 0.30:
            final_diagnosis = 'Both (Mixed)'
            final_id = 'both_mixed'
            overall_states = peak_states
            mixed_candidates = [lp['probabilities']['Both (Mixed)'] for lp in leaf_predictions]
            final_confidence = max(max(mixed_candidates), peak_states['Both (Mixed)'])
            if final_confidence < 50.0:
                final_confidence = round(max(max_p_tuta, max_p_liri) * 100, 2)
        elif max_p_tuta >= 0.30:
            final_diagnosis = 'Tuta Absoluta'
            final_id = 'tuta_absoluta'
            worst_tuta_leaf = max(tuta_leaves, key=lambda l: l['probabilities']['Tuta Absoluta'])
            overall_states = worst_tuta_leaf['probabilities']
            final_confidence = worst_tuta_leaf['probabilities']['Tuta Absoluta']
        elif max_p_liri >= 0.30:
            final_diagnosis = 'Liriomyza'
            final_id = 'liriomyza'
            worst_liri_leaf = max(liri_leaves, key=lambda l: l['probabilities']['Liriomyza'])
            overall_states = worst_liri_leaf['probabilities']
            final_confidence = worst_liri_leaf['probabilities']['Liriomyza']
        else:
            final_diagnosis = 'Healthy'
            final_id = 'healthy'
            avg_h = sum(lp['probabilities']['Healthy'] for lp in leaf_predictions) / num_leaves
            avg_t = sum(lp['probabilities']['Tuta Absoluta'] for lp in leaf_predictions) / num_leaves
            avg_l = sum(lp['probabilities']['Liriomyza'] for lp in leaf_predictions) / num_leaves
            avg_m = sum(lp['probabilities']['Both (Mixed)'] for lp in leaf_predictions) / num_leaves
            overall_states = {
                'Healthy': round(avg_h, 2),
                'Tuta Absoluta': round(avg_t, 2),
                'Liriomyza': round(avg_l, 2),
                'Both (Mixed)': round(avg_m, 2),
            }
            final_confidence = overall_states['Healthy']
        infestation_spread = f"{infected_count} of {num_leaves} leaves ({round((infected_count / num_leaves) * 100)}%)"

    model_result = {
        'status': 'success',
        'predicted_class': final_diagnosis,
        'disease_id': final_id,
        'confidence': round(final_confidence, 2),
        'confidence_pct': f"{round(final_confidence)}%",
        'p_tuta_pct': round(max_p_tuta * 100, 1),
        'p_liri_pct': round(max_p_liri * 100, 1),
        'probabilities': overall_states,
        'leaves_analyzed': num_leaves,
        'infected_leaves_count': infected_count,
        'infestation_stage': infestation_stage,
        'spread_level': spread_level,
        'infestation_spread': f"{infected_count} of {num_leaves} leaves ({round((infected_count / num_leaves) * 100)}%)",
        'leaf_predictions': leaf_predictions,
        'farmer_data': farmer_data or {},
        'model_name': f"{MODEL_ARCHITECTURE} ({MODEL_PATH})",
        'device': str(DEVICE),
    }

    # Pass model predictions + farmer details to LLM for customized advisory
    llm_advisory = generate_llm_advisory(model_result, farmer_data)
    model_result['llm_advisory'] = llm_advisory

    return model_result


class AgroNexRequestHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self, status=200, content_type='application/json'):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_cors_headers(200)

    def do_GET(self):
        if self.path in ('/', '/health'):
            response_data = {
                'status': 'online',
                'app': 'AgroNex Production Tomato Pest Server',
                'device': str(DEVICE),
                'model_file': os.path.basename(MODEL_PATH),
                'architecture': 'MobileNetV2 4-Class Softmax Neural Engine',
                'states': ['Healthy', 'Tuta Absoluta', 'Liriomyza', 'Both (Mixed)'],
                'llm_enabled': bool(os.environ.get('GEMINI_API_KEY') or os.environ.get('OPENAI_API_KEY')),
            }
            body = json.dumps(response_data, indent=2).encode('utf-8')
            self._set_cors_headers(200)
            self.wfile.write(body)
        else:
            self._set_cors_headers(404)
            self.wfile.write(json.dumps({'error': 'Not Found'}).encode('utf-8'))

    def do_POST(self):
        if self.path != '/predict':
            self._set_cors_headers(404)
            self.wfile.write(json.dumps({'error': 'Endpoint not found'}).encode('utf-8'))
            return

        content_type = self.headers.get('Content-Type', '')
        content_length = int(self.headers.get('Content-Length', 0))

        if content_length <= 0:
            self._set_cors_headers(400)
            self.wfile.write(json.dumps({'error': 'Empty request body'}).encode('utf-8'))
            return

        raw_body = self.rfile.read(content_length)
        pil_images = []
        farmer_data = {}

        try:
            if 'multipart/form-data' in content_type:
                # Parse multipart using email parser
                msg_header = f"Content-Type: {content_type}\r\n\r\n".encode('latin-1')
                msg = BytesParser(policy=policy.default).parsebytes(msg_header + raw_body)
                for part in msg.iter_parts():
                    cd = part.get('content-disposition', '')
                    param_name = part.get_param('name', header='content-disposition')
                    if 'form-data' in cd:
                        filename = part.get_filename()
                        payload = part.get_payload(decode=True)
                        if payload:
                            if param_name == 'farmer_data':
                                try:
                                    farmer_data = json.loads(payload.decode('utf-8'))
                                except Exception:
                                    pass
                                continue

                            img = None
                            try:
                                img = Image.open(io.BytesIO(payload)).convert('RGB')
                            except Exception:
                                try:
                                    text_val = payload.decode('utf-8', errors='ignore').strip()
                                    img = decode_image_from_source(text_val)
                                except Exception as dec_err:
                                    print(f"[WARN] Failed part decode: {dec_err}", flush=True)
                            if img:
                                pil_images.append(img)

            else:
                # Assume JSON payload
                try:
                    data = json.loads(raw_body.decode('utf-8'))
                except Exception:
                    data = {}

                farmer_data = data.get('farmer_data', {})
                sources = []
                if isinstance(data, list):
                    sources = data
                elif isinstance(data, dict):
                    sources = data.get('images', [])
                    if not sources and 'image' in data:
                        sources = [data['image']]

                for s in sources:
                    try:
                        img = decode_image_from_source(s)
                        if img:
                            pil_images.append(img)
                    except Exception as dec_err:
                        print(f"[WARN] Failed decoding source: {dec_err}", flush=True)

            if not pil_images:
                self._set_cors_headers(400)
                self.wfile.write(json.dumps({
                    'status': 'error',
                    'error': 'No valid images could be processed. Please provide 1 to 4 leaf photos.'
                }).encode('utf-8'))
                return

            # Run PyTorch ResNet-50 inference + LLM Advisory Generation
            result = run_multi_leaf_pest_prediction(pil_images, farmer_data)
            print(
                f"[PREDICTION + LLM] Analyzed {result['leaves_analyzed']} leaves for farm: {farmer_data.get('land', '1_acre')} "
                f"-> {result['predicted_class']} ({result['confidence_pct']}) | LLM: {result['llm_advisory'].get('source')}",
                flush=True
            )

            resp_json = json.dumps(result).encode('utf-8')
            self._set_cors_headers(200)
            self.wfile.write(resp_json)

        except Exception as e:
            print(f"[ERROR] Inference error: {e}", flush=True)
            import traceback
            traceback.print_exc()
            self._set_cors_headers(500)
            self.wfile.write(json.dumps({'status': 'error', 'error': str(e)}).encode('utf-8'))

    def log_message(self, format, *args):
        # Clean logging
        print(f"[HTTP] {self.address_string()} - {format % args}", flush=True)


def run_server():
    server = ThreadingHTTPServer((HOST, PORT), AgroNexRequestHandler)
    print(f"\n=======================================================", flush=True)
    print(f" AgroNex Production Tomato Pest Detection & LLM Advisory Server", flush=True)
    print(f" URL: http://localhost:{PORT}", flush=True)
    print(f" Model: {os.path.basename(MODEL_PATH)} (from predict_pest.py)", flush=True)
    print(f" Health check: http://localhost:{PORT}/health", flush=True)
    print(f" Device: {DEVICE}", flush=True)
    print(f"=======================================================\n", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down AgroNex server.", flush=True)
        server.server_close()


if __name__ == '__main__':
    run_server()

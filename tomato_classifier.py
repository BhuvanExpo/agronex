import os
import numpy as np
from PIL import Image
import torch
import torch.nn as nn
from torchvision import models, transforms

CLASS_NAMES = ["Healthy", "Tuta Absoluta", "Liriomyza", "Both (Mixed)"]


class TomatoPestClassifier:

  def __init__(self, model_path="best_mobilenet_v2.pth"):
    # Automatically select MPS (Mac), CUDA (NVIDIA), or CPU
    if torch.backends.mps.is_available():
      self.device = torch.device("mps")
    elif torch.cuda.is_available():
      self.device = torch.device("cuda")
    else:
      self.device = torch.device("cpu")

    if not os.path.exists(model_path) and os.path.exists("model train/best_mobilenet_v2.pth"):
      model_path = "model train/best_mobilenet_v2.pth"

    # Pre-load checkpoint to detect classes
    checkpoint = torch.load(
        model_path, map_location=self.device, weights_only=False
    )
    classes = checkpoint.get("classes", CLASS_NAMES) if isinstance(checkpoint, dict) else CLASS_NAMES
    num_classes = len(classes)

    # Reconstruct MobileNetV2 architecture
    self.model = models.mobilenet_v2(weights=None)
    in_features = self.model.classifier[1].in_features
    self.model.classifier = nn.Sequential(
        nn.Dropout(p=0.3), nn.Linear(in_features, num_classes)
    )

    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
      self.model.load_state_dict(checkpoint["model_state_dict"])
    else:
      self.model.load_state_dict(checkpoint)

    self.model.to(self.device)
    self.model.eval()
    self.classes = classes

    # Preprocessing pipeline
    self.transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
        ),
    ])

  def predict(self, image_path_or_pil):
    if isinstance(image_path_or_pil, str):
      image = Image.open(image_path_or_pil).convert("RGB")
    else:
      image = image_path_or_pil.convert("RGB")

    tensor = self.transform(image).unsqueeze(0).to(self.device)

    with torch.no_grad():
      logits = self.model(tensor)
      probs = torch.softmax(logits, dim=1)[0].cpu().numpy()

    p_healthy = float(probs[0]) * 100
    p_tuta = float(probs[1]) * 100
    p_liri = float(probs[2]) * 100
    p_mixed = float(probs[3]) * 100

    pred_idx = int(np.argmax(probs))
    final_label = self.classes[pred_idx]
    confidence = float(probs[pred_idx]) * 100

    probs_dict = {
        "HEALTHY": round(p_healthy, 2),
        "TUTA ABSOLUTA": round(p_tuta, 2),
        "LIRIOMYZA": round(p_liri, 2),
        "BOTH (MIXED)": round(p_mixed, 2),
    }

    return {
        "diagnosis": final_label.upper(),
        "confidence": round(confidence, 2),
        "symptoms": {
            "tuta_blotch_score": round(p_tuta + (p_mixed if pred_idx == 3 else 0), 2),
            "liriomyza_serpentine_score": round(p_liri + (p_mixed if pred_idx == 3 else 0), 2),
        },
        "all_probabilities": probs_dict,
    }


# Quick test
if __name__ == "__main__":
  import sys
  test_image = sys.argv[1] if len(sys.argv) > 1 else "assets/samples/tuta.jpg"
  if os.path.exists(test_image):
    classifier = TomatoPestClassifier("best_mobilenet_v2.pth")
    result = classifier.predict(test_image)
    print(f"\n--- Tomato Pest Diagnosis ({os.path.basename(test_image)}) ---")
    print(f"Diagnosis : {result['diagnosis']} ({result['confidence']}%)")
    print(f"Symptoms  : Tuta={result['symptoms']['tuta_blotch_score']}%, Liriomyza={result['symptoms']['liriomyza_serpentine_score']}%")
    print(f"Probabilities: {result['all_probabilities']}\n")
  else:
    print(f"File not found: {test_image}")
    print("Usage: python3 tomato_classifier.py <path_to_leaf_image>")

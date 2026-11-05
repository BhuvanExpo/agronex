import os
import numpy as np
from PIL import Image
import torch
import torch.nn as nn
from torchvision import models, transforms


class TomatoPestClassifier:

  def __init__(self, model_path="best_mobilenet_v2.pth"):
    # Automatically select MPS (Mac), CUDA (NVIDIA), or CPU
    if torch.backends.mps.is_available():
      self.device = torch.device("mps")
    elif torch.cuda.is_available():
      self.device = torch.device("cuda")
    else:
      self.device = torch.device("cpu")

    if not os.path.exists(model_path) and os.path.exists("best_real_pest_model.pth"):
      model_path = "best_real_pest_model.pth"

    # Reconstruct exact architecture
    if "mobilenet" in model_path.lower():
      self.model = models.mobilenet_v2(weights=None)
      in_features = self.model.classifier[1].in_features
      self.model.classifier = nn.Sequential(
          nn.Dropout(p=0.2), nn.Linear(in_features, 2)
      )
    else:
      self.model = models.resnet50(weights=None)
      in_features = self.model.fc.in_features
      self.model.fc = nn.Sequential(
          nn.Dropout(p=0.3), nn.Linear(in_features, 2)  # [Tuta, Liriomyza]
      )

    # Load trained weights
    checkpoint = torch.load(
        model_path, map_location=self.device, weights_only=False
    )
    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
      self.model.load_state_dict(checkpoint["model_state_dict"])
    else:
      self.model.load_state_dict(checkpoint)
    self.model.to(self.device)
    self.model.eval()

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
      probs = torch.sigmoid(logits)[0]
      p_tuta = probs[0].item()
      p_liri = probs[1].item()

    # Calculate 4-state joint distribution
    p_healthy = (1.0 - p_tuta) * (1.0 - p_liri)
    p_tuta_only = p_tuta * (1.0 - p_liri)
    p_liri_only = (1.0 - p_tuta) * p_liri
    p_mixed = p_tuta * p_liri

    total = p_healthy + p_tuta_only + p_liri_only + p_mixed
    probs_dict = {
        "HEALTHY": round((p_healthy / total) * 100, 2),
        "TUTA ABSOLUTA": round((p_tuta_only / total) * 100, 2),
        "LIRIOMYZA": round((p_liri_only / total) * 100, 2),
        "MIXED INFESTATION": round((p_mixed / total) * 100, 2),
    }

    # Final Diagnosis Decision
    if p_tuta >= 0.30 and p_liri >= 0.30:
      final_label = "MIXED INFESTATION (Both Tuta & Liriomyza)"
      confidence = probs_dict["MIXED INFESTATION"]
    else:
      final_label = max(probs_dict, key=probs_dict.get)
      confidence = probs_dict[final_label]

    return {
        "diagnosis": final_label,
        "confidence": confidence,
        "symptoms": {
            "tuta_blotch_score": round(p_tuta * 100, 2),
            "liriomyza_serpentine_score": round(p_liri * 100, 2),
        },
        "all_probabilities": probs_dict,
    }


# Quick test
if __name__ == "__main__":
  import sys
  test_image = sys.argv[1] if len(sys.argv) > 1 else "assets/samples/tuta.jpg"
  if os.path.exists(test_image):
    classifier = TomatoPestClassifier("best_real_pest_model.pth")
    result = classifier.predict(test_image)
    print(f"\n--- Tomato Pest Diagnosis ({os.path.basename(test_image)}) ---")
    print(f"Diagnosis : {result['diagnosis']} ({result['confidence']}%)")
    print(f"Symptoms  : Tuta={result['symptoms']['tuta_blotch_score']}%, Liriomyza={result['symptoms']['liriomyza_serpentine_score']}%")
    print(f"Probabilities: {result['all_probabilities']}\n")
  else:
    print(f"File not found: {test_image}")
    print("Usage: python3 tomato_classifier.py <path_to_leaf_image>")

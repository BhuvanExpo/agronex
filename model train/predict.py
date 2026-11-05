import sys
import os
import argparse
from PIL import Image
import torch
import torch.nn as nn
from torchvision import transforms, models

def predict_tomato_pest(image_path, model_path="best_real_pest_model.pth"):
    if not os.path.exists(image_path):
        print(f"Error: File '{image_path}' not found.")
        return

    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")

    # Load model architecture
    model = models.resnet50(weights=None)
    in_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 2) # [Tuta, Liriomyza]
    )

    checkpoint = torch.load(model_path, map_location=device, weights_only=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(device)
    model.eval()

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    image = Image.open(image_path).convert("RGB")
    tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        logits = model(tensor)
        probs = torch.sigmoid(logits)[0]
        p_tuta = probs[0].item()
        p_liri = probs[1].item()

    # Joint 4-State Probability Distribution:
    p_healthy = (1.0 - p_tuta) * (1.0 - p_liri)
    p_tuta_only = p_tuta * (1.0 - p_liri)
    p_liri_only = (1.0 - p_tuta) * p_liri
    p_mixed = p_tuta * p_liri

    # Normalize to 100%
    total_p = p_healthy + p_tuta_only + p_liri_only + p_mixed
    p_healthy_norm = (p_healthy / total_p) * 100
    p_tuta_norm = (p_tuta_only / total_p) * 100
    p_liri_norm = (p_liri_only / total_p) * 100
    p_mixed_norm = (p_mixed / total_p) * 100

    states = {
        "MIXED INFESTATION (Both Tuta & Liriomyza)": p_mixed_norm,
        "TUTA ABSOLUTA": p_tuta_norm,
        "LIRIOMYZA": p_liri_norm,
        "HEALTHY": p_healthy_norm,
    }

    if p_tuta >= 0.30 and p_liri >= 0.30:
        diagnosis = "MIXED INFESTATION (Both Tuta & Liriomyza)"
        confidence = p_mixed_norm
    else:
        diagnosis = max(states, key=states.get)
        confidence = states[diagnosis]

    print("\n" + "=" * 65)
    print(f" TOMATO LEAF PEST DIAGNOSIS: {os.path.basename(image_path)}")
    print("=" * 65)
    print(f" FINAL DIAGNOSIS    : >>> [ {diagnosis} ] <<<")
    print(f" STATUS CONFIDENCE  : {confidence:.2f}%\n")
    print(" 4-WAY CLASSIFICATION PROBABILITIES:")
    for name, val in states.items():
        bar = "█" * int(val / 4)
        print(f"  • {name:<42}: {val:6.2f}% {bar}")
    print("-" * 65)
    print(" INDIVIDUAL PEST SYMPTOM DETECTION:")
    bar_t = "█" * int(p_tuta * 25)
    bar_l = "█" * int(p_liri * 25)
    print(f"  - Tuta Absoluta (Blotch Mines / Frass) : {p_tuta*100:6.2f}% {bar_t}")
    print(f"  - Liriomyza (Serpentine Leaf Mines)   : {p_liri*100:6.2f}% {bar_l}")
    print("=" * 65 + "\n")

    return diagnosis, states

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Tomato Leaf 4-Way Pest Classifier")
    parser.add_argument("image_path", type=str, help="Path to leaf image")
    parser.add_argument("--model", type=str, default="best_real_pest_model.pth", help="Model path")
    args = parser.parse_args()

    predict_tomato_pest(args.image_path, args.model)

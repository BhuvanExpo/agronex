import sys
import os
import argparse
from PIL import Image
import torch
import torch.nn as nn
from torchvision import transforms, models

def predict_4class(image_path, model_path="best_4class_model.pth"):
    if not os.path.exists(image_path):
        print(f"Error: File '{image_path}' not found.")
        return

    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    checkpoint = torch.load(model_path, map_location=device)
    class_names = checkpoint.get("classes", ["Healthy", "Tuta Absoluta", "Liriomyza", "Both (Mixed)"])

    # Build model architecture
    model = models.resnet50(weights=None)
    in_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, len(class_names))
    )
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
        outputs = model(tensor)
        probs = torch.softmax(outputs, dim=1)[0]
        pred_idx = torch.argmax(probs).item()

    print(f"\n=======================================================")
    print(f" Diagnosis Result: {os.path.basename(image_path)}")
    print(f"=======================================================")
    print(f" Detected Condition : >>> {class_names[pred_idx]} <<<")
    print(f" Confidence         : {probs[pred_idx].item()*100:.2f}%\n")
    print(" Class Probability Breakdown:")
    for idx, name in enumerate(class_names):
        bar = "█" * int(probs[idx].item() * 25)
        print(f"  • {name:<16}: {probs[idx].item()*100:6.2f}% {bar}")
    print(f"=======================================================\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Classify Tomato Leaf Pest Disease")
    parser.add_argument("image_path", type=str, help="Path to leaf image")
    parser.add_argument("--model", type=str, default="best_4class_model.pth", help="Path to trained model")
    args = parser.parse_args()

    predict_4class(args.image_path, args.model)


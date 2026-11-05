import os
import sys
import time
import argparse
import numpy as np
import pandas as pd
from PIL import Image
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from sklearn.metrics import classification_report, confusion_matrix

CLASS_NAMES = ["Healthy", "Tuta Absoluta", "Liriomyza", "Both (Mixed)"]

class RealTomatoDataset(Dataset):
    def __init__(self, csv_file, img_dir, transform=None):
        self.df = pd.read_csv(csv_file)
        self.img_dir = img_dir
        self.transform = transform

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img_path = os.path.join(self.img_dir, row["filename"])
        image = Image.open(img_path).convert("RGB")
        label = int(row["label"])
        if self.transform:
            image = self.transform(image)
        return image, label

def get_transforms(img_size=224):
    train_transform = transforms.Compose([
        transforms.Resize((img_size + 32, img_size + 32)),
        transforms.RandomResizedCrop(img_size, scale=(0.4, 1.0)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.5),
        transforms.RandomRotation(degrees=30),
        transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.05),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    eval_transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    return train_transform, eval_transform

def train_epoch(model, loader, criterion, optimizer, device):
    model.train()
    running_loss, correct, total = 0.0, 0, 0
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        _, preds = outputs.max(1)
        correct += preds.eq(labels).sum().item()
        total += labels.size(0)
    return running_loss / total, correct / total

def eval_epoch(model, loader, criterion, device):
    model.eval()
    running_loss, correct, total = 0.0, 0, 0
    all_preds, all_labels = [], []
    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * images.size(0)
            _, preds = outputs.max(1)
            correct += preds.eq(labels).sum().item()
            total += labels.size(0)

            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
    return running_loss / total, correct / total, np.array(all_preds), np.array(all_labels)

def main():
    parser = argparse.ArgumentParser(description="Train Real Field MobileNetV2 4-Class Pest Detector")
    parser.add_argument("--epochs", type=int, default=8, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=2e-4, help="Learning rate")
    args = parser.parse_args()

    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    print(f"Using compute device: {device}", flush=True)

    base_dir = "/Users/bhuvangm/Dev/agronex/model train/dataset_real_4class"
    img_dir = os.path.join(base_dir, "images")
    splits_dir = os.path.join(base_dir, "splits")

    train_tf, eval_tf = get_transforms()

    train_ds = RealTomatoDataset(os.path.join(splits_dir, "train.csv"), img_dir, train_tf)
    val_ds = RealTomatoDataset(os.path.join(splits_dir, "val.csv"), img_dir, eval_tf)
    test_ds = RealTomatoDataset(os.path.join(splits_dir, "test.csv"), img_dir, eval_tf)

    print(f"Loaded Real Field Dataset: {len(train_ds)} Train | {len(val_ds)} Val | {len(test_ds)} Test images.", flush=True)

    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True, num_workers=2, persistent_workers=True)
    val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False, num_workers=2, persistent_workers=True)
    test_loader = DataLoader(test_ds, batch_size=args.batch_size, shuffle=False, num_workers=2)

    print("Building MobileNetV2 architecture with ImageNet pre-trained weights...", flush=True)
    weights = models.MobileNet_V2_Weights.DEFAULT
    model = models.mobilenet_v2(weights=weights)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 4)  # 4 classes
    )
    model = model.to(device)

    criterion = nn.CrossEntropyLoss(label_smoothing=0.05)
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs, eta_min=1e-6)

    best_val_acc = 0.0
    save_path = "/Users/bhuvangm/Dev/agronex/model train/best_mobilenet_v2.pth"
    root_save_path = "/Users/bhuvangm/Dev/agronex/best_mobilenet_v2.pth"

    print("\n--- Starting Model Training on Authentic Field Images ---", flush=True)
    start_time = time.time()
    for epoch in range(1, args.epochs + 1):
        ep_start = time.time()
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc, _, _ = eval_epoch(model, val_loader, criterion, device)
        scheduler.step()
        ep_time = time.time() - ep_start

        print(f"Epoch {epoch:02d}/{args.epochs:02d} [{ep_time:.1f}s] - Train Loss: {train_loss:.4f}, Train Acc: {train_acc*100:.2f}% | Val Loss: {val_loss:.4f}, Val Acc: {val_acc*100:.2f}%", flush=True)

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save({
                "model_state_dict": model.state_dict(),
                "classes": CLASS_NAMES,
                "val_acc": val_acc,
                "architecture": "mobilenet_v2",
            }, save_path)
            torch.save(model.state_dict(), root_save_path)

    total_time = time.time() - start_time
    print(f"\nTraining completed in {total_time:.1f}s. Best Val Accuracy: {best_val_acc*100:.2f}%", flush=True)

    # Evaluate on unseen test set
    print("\n--- Evaluating on Unseen Field Test Set (360 Images) ---", flush=True)
    checkpoint = torch.load(save_path, map_location=device)
    model.load_state_dict(checkpoint["model_state_dict"])
    test_loss, test_acc, test_preds, test_labels = eval_epoch(model, test_loader, criterion, device)

    print(f"Final Test Accuracy: {test_acc*100:.2f}%", flush=True)
    print("\nClassification Report:", flush=True)
    print(classification_report(test_labels, test_preds, target_names=CLASS_NAMES, digits=4), flush=True)

    # Evaluate directly on User Camera Test Images
    print("\n--- Evaluating on User's Camera Photos ---", flush=True)
    user_test_images = [
        ("WhatsApp Image 2026-11-05 at 01.01.57.jpeg (Tuta)", "/Users/bhuvangm/Dev/agronex/model train/test /WhatsApp Image 2026-11-05 at 01.01.57.jpeg"),
        ("WhatsApp Image 2026-11-05 at 02.24.33.jpeg (Liri)", "/Users/bhuvangm/Dev/agronex/model train/test /WhatsApp Image 2026-11-05 at 02.24.33.jpeg"),
        ("eas.jpeg (Tuta)", "/Users/bhuvangm/Dev/agronex/model train/eas.jpeg"),
        ("images.jpeg (Mixed)", "/Users/bhuvangm/Dev/agronex/model train/test /images.jpeg"),
        ("sample_healthy.jpg (Healthy)", "/Users/bhuvangm/Dev/agronex/assets/samples/healthy.jpg"),
        ("sample_tuta.jpg (Tuta)", "/Users/bhuvangm/Dev/agronex/assets/samples/tuta.jpg"),
        ("sample_liriomyza.jpg (Liriomyza)", "/Users/bhuvangm/Dev/agronex/assets/samples/liriomyza.jpg"),
    ]

    model.eval()
    for name, p in user_test_images:
        if not os.path.exists(p): continue
        img = Image.open(p).convert("RGB")
        tensor = eval_tf(img).unsqueeze(0).to(device)
        with torch.no_grad():
            outputs = model(tensor)
            probs = torch.softmax(outputs, dim=1)[0].cpu().numpy()
            pred_idx = np.argmax(probs)
            pred_class = CLASS_NAMES[pred_idx]
            conf = probs[pred_idx] * 100
        print(f"  {name:40s} -> Predicted: {pred_class:15s} ({conf:.1f}% conf)", flush=True)

    # Export to WebGL-Compatible ONNX
    print("\n--- Exporting to Mobile WebGL ONNX ---", flush=True)
    model.eval()
    model.to("cpu")
    dummy_input = torch.randn(1, 3, 224, 224, dtype=torch.float32)

    onnx_path = "/Users/bhuvangm/Dev/agronex/model train/mobilenet_v2_pest.onnx"
    assets_onnx_path = "/Users/bhuvangm/Dev/agronex/assets/models/mobilenet_v2_pest.onnx"
    os.makedirs(os.path.dirname(assets_onnx_path), exist_ok=True)

    torch.onnx.export(
        model,
        dummy_input,
        onnx_path,
        input_names=["input"],
        output_names=["logits"],
        dynamic_axes={"input": {0: "batch_size"}, "logits": {0: "batch_size"}},
        opset_version=12
    )
    import shutil
    shutil.copy(onnx_path, assets_onnx_path)
    print(f"ONNX Model saved to: {onnx_path} ({os.path.getsize(onnx_path)/1024/1024:.2f} MB)", flush=True)

    # Verify ONNX Runtime accuracy
    import onnxruntime as ort
    session = ort.InferenceSession(onnx_path)
    onnx_correct = 0
    for i in range(len(test_ds)):
        img, lbl = test_ds[i]
        out = session.run(["logits"], {"input": img.unsqueeze(0).numpy()})[0][0]
        pred = np.argmax(out)
        if pred == lbl:
            onnx_correct += 1
    print(f"ONNX Model Exact Accuracy on Unseen Test Set: {onnx_correct/len(test_ds)*100:.2f}% ({onnx_correct}/{len(test_ds)})", flush=True)

if __name__ == "__main__":
    main()

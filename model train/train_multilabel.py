import os
import time
import argparse
import pandas as pd
from PIL import Image
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from sklearn.metrics import classification_report, roc_auc_score

class TomatoMultiLabelDataset(Dataset):
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
        target = torch.tensor([float(row["has_tuta"]), float(row["has_liriomyza"])], dtype=torch.float32)
        
        if self.transform:
            image = self.transform(image)
            
        return image, target

def get_transforms(img_size=224):
    train_transform = transforms.Compose([
        transforms.Resize((img_size + 32, img_size + 32)),
        transforms.RandomResizedCrop(img_size, scale=(0.8, 1.0)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.5),
        transforms.RandomRotation(degrees=25),
        transforms.ColorJitter(brightness=0.25, contrast=0.25, saturation=0.25),
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
    running_loss, total = 0.0, 0

    for images, targets in loader:
        images, targets = images.to(device), targets.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, targets)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        total += targets.size(0)

    return running_loss / total

def eval_epoch(model, loader, criterion, device, threshold=0.5):
    model.eval()
    running_loss, total = 0.0, 0
    all_preds, all_targets = [], []

    with torch.no_grad():
        for images, targets in loader:
            images, targets = images.to(device), targets.to(device)
            outputs = model(images)
            loss = criterion(outputs, targets)

            running_loss += loss.item() * images.size(0)
            total += targets.size(0)

            probs = torch.sigmoid(outputs)
            all_preds.append(probs.cpu().numpy())
            all_targets.append(targets.cpu().numpy())

    all_preds = np.vstack(all_preds)
    all_targets = np.vstack(all_targets)
    binary_preds = (all_preds >= threshold).astype(int)

    # Exact match ratio
    exact_match = (binary_preds == all_targets).all(axis=1).mean()

    return running_loss / total, exact_match, all_preds, all_targets

def main():
    parser = argparse.ArgumentParser(description="Train 100% Real Tomato Pest Detector (M4 MPS)")
    parser.add_argument("--epochs", type=int, default=12, help="Number of epochs")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=2e-4, help="Learning rate")
    args = parser.parse_args()

    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    print(f"Using compute device: {device}")

    data_dir = "dataset_multilabel"
    img_dir = os.path.join(data_dir, "images")
    splits_dir = os.path.join(data_dir, "splits")

    train_transform, eval_transform = get_transforms()

    train_dataset = TomatoMultiLabelDataset(os.path.join(splits_dir, "train.csv"), img_dir, transform=train_transform)
    val_dataset = TomatoMultiLabelDataset(os.path.join(splits_dir, "val.csv"), img_dir, transform=eval_transform)
    test_dataset = TomatoMultiLabelDataset(os.path.join(splits_dir, "test.csv"), img_dir, transform=eval_transform)

    print(f"Loaded Real Dataset: {len(train_dataset)} Train | {len(val_dataset)} Val | {len(test_dataset)} Test images.")

    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False, num_workers=4)
    test_loader = DataLoader(test_dataset, batch_size=args.batch_size, shuffle=False, num_workers=4)

    # Backbone
    print("Building ResNet50 model with pre-trained weights...")
    weights = models.ResNet50_Weights.DEFAULT
    model = models.resnet50(weights=weights)
    in_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 2) # [Tuta, Liriomyza]
    )
    model = model.to(device)

    criterion = nn.BCEWithLogitsLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs, eta_min=1e-6)

    best_val_score = 0.0
    best_model_path = "best_real_pest_model.pth"

    print("\n--- Starting Training on 100% Real Images ---")
    start_time = time.time()
    for epoch in range(1, args.epochs + 1):
        epoch_start = time.time()
        train_loss = train_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc, _, _ = eval_epoch(model, val_loader, criterion, device)
        scheduler.step()

        elapsed = time.time() - epoch_start
        print(f"Epoch {epoch:02d}/{args.epochs:02d} [{elapsed:.1f}s] - Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f}, Val Exact Match: {val_acc*100:.2f}%")

        if val_acc > best_val_score:
            best_val_score = val_acc
            torch.save({
                "model_state_dict": model.state_dict(),
                "model_name": "resnet50",
                "val_exact_match": val_acc
            }, best_model_path)

    total_time = time.time() - start_time
    print(f"\nTraining completed in {total_time/60:.2f} minutes.")
    print(f"Best Validation Accuracy: {best_val_score*100:.2f}% (Saved to {best_model_path})")

    # Final evaluation on Unseen Test Set
    print("\n--- Evaluating on Unseen Test Set (Real Images) ---")
    checkpoint = torch.load(best_model_path, map_location=device, weights_only=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    test_loss, test_exact_match, test_probs, test_targets = eval_epoch(model, test_loader, criterion, device)

    print(f"Test Exact Match Accuracy: {test_exact_match*100:.2f}%")

    tuta_preds = (test_probs[:, 0] >= 0.5).astype(int)
    tuta_targets = test_targets[:, 0].astype(int)
    tuta_acc = (tuta_preds == tuta_targets).mean()

    liri_preds = (test_probs[:, 1] >= 0.5).astype(int)
    liri_targets = test_targets[:, 1].astype(int)
    liri_acc = (liri_preds == liri_targets).mean()

    print(f"• Tuta Absoluta Detection Accuracy: {tuta_acc*100:.2f}%")
    print(f"• Liriomyza Detection Accuracy   : {liri_acc*100:.2f}%")

if __name__ == "__main__":
    main()


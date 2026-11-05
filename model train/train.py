import os
import time
import argparse
import pandas as pd
from PIL import Image
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt

class TomatoLeafDataset(Dataset):
    def __init__(self, csv_file, img_dir, transform=None):
        self.df = pd.read_csv(csv_file)
        self.img_dir = img_dir
        self.transform = transform

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        rel_path = row["relative_path"].replace("\\", "/")
        img_path = os.path.join(self.img_dir, rel_path)
        
        image = Image.open(img_path).convert("RGB")
        label = int(row["binary_label"])
        
        if self.transform:
            image = self.transform(image)
            
        return image, label

def get_transforms(img_size=224):
    train_transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
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
    running_loss = 0.0
    correct = 0
    total = 0

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
    running_loss = 0.0
    correct = 0
    total = 0
    all_preds = []
    all_labels = []

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

    return running_loss / total, correct / total, all_preds, all_labels

def main():
    parser = argparse.ArgumentParser(description="Fast Tomato Leaf Damage Classifier on Apple Silicon M4")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=64, help="Batch size for DataLoader")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate")
    parser.add_argument("--model-name", type=str, default="mobilenet_v3_large", choices=["mobilenet_v3_large", "resnet18", "resnet50"])
    parser.add_argument("--data-dir", type=str, default="ChipToCrop_Training")
    args = parser.parse_args()

    # Determine hardware acceleration (MPS for Apple Silicon M4)
    if torch.backends.mps.is_available():
        device = torch.device("mps")
        print("Using Apple Silicon M4 GPU (MPS) for high-speed training.")
    elif torch.cuda.is_available():
        device = torch.device("cuda")
        print("Using NVIDIA CUDA GPU.")
    else:
        device = torch.device("cpu")
        print("Using CPU.")

    img_dir = os.path.join(args.data_dir, "images")
    splits_dir = os.path.join(args.data_dir, "splits")

    train_csv = os.path.join(splits_dir, "train.csv")
    val_csv = os.path.join(splits_dir, "validation.csv")
    test_csv = os.path.join(splits_dir, "test.csv")

    train_transform, eval_transform = get_transforms()

    train_dataset = TomatoLeafDataset(train_csv, img_dir, transform=train_transform)
    val_dataset = TomatoLeafDataset(val_csv, img_dir, transform=eval_transform)
    test_dataset = TomatoLeafDataset(test_csv, img_dir, transform=eval_transform)

    print(f"Loaded: {len(train_dataset)} Train | {len(val_dataset)} Val | {len(test_dataset)} Test images.")

    # High performance dataloaders
    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, num_workers=4, pin_memory=False)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False, num_workers=4, pin_memory=False)
    test_loader = DataLoader(test_dataset, batch_size=args.batch_size, shuffle=False, num_workers=4, pin_memory=False)

    num_classes = 2 # 0: Healthy, 1: Non-Healthy (Infested/Damaged)
    class_names = ["Healthy", "Non-Healthy (Damaged)"]

    print(f"Initializing {args.model_name} with ImageNet pre-trained weights...")
    if args.model_name == "mobilenet_v3_large":
        weights = models.MobileNet_V3_Large_Weights.DEFAULT
        model = models.mobilenet_v3_large(weights=weights)
        in_features = model.classifier[3].in_features
        model.classifier[3] = nn.Linear(in_features, num_classes)
    elif args.model_name == "resnet18":
        weights = models.ResNet18_Weights.DEFAULT
        model = models.resnet18(weights=weights)
        in_features = model.fc.in_features
        model.fc = nn.Linear(in_features, num_classes)
    elif args.model_name == "resnet50":
        weights = models.ResNet50_Weights.DEFAULT
        model = models.resnet50(weights=weights)
        in_features = model.fc.in_features
        model.fc = nn.Linear(in_features, num_classes)

    model = model.to(device)

    # Class balance weighting
    train_labels = train_dataset.df["binary_label"].value_counts()
    count_0 = train_labels.get(0, 1)
    count_1 = train_labels.get(1, 1)
    weight = torch.tensor([1.0, count_0 / count_1], dtype=torch.float).to(device)
    criterion = nn.CrossEntropyLoss(weight=weight)

    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs)

    best_val_acc = 0.0
    best_model_path = "best_model.pth"
    history = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": []}

    start_time = time.time()
    print("\n--- Starting Training ---")
    for epoch in range(1, args.epochs + 1):
        epoch_start = time.time()
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc, _, _ = eval_epoch(model, val_loader, criterion, device)
        scheduler.step()

        history["train_loss"].append(train_loss)
        history["train_acc"].append(train_acc)
        history["val_loss"].append(val_loss)
        history["val_acc"].append(val_acc)

        elapsed = time.time() - epoch_start
        print(f"Epoch {epoch:02d}/{args.epochs:02d} [{elapsed:.1f}s] - Train Loss: {train_loss:.4f}, Train Acc: {train_acc*100:.2f}% | Val Loss: {val_loss:.4f}, Val Acc: {val_acc*100:.2f}%")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save({
                "model_state_dict": model.state_dict(),
                "model_name": args.model_name,
                "classes": class_names,
                "val_acc": val_acc
            }, best_model_path)

    total_training_time = time.time() - start_time
    print(f"\nTraining completed in {total_training_time/60:.2f} minutes.")
    print(f"Best Validation Accuracy: {best_val_acc*100:.2f}% (Saved to {best_model_path})")

    # Plot & save learning curves
    plt.figure(figsize=(10, 4))
    plt.subplot(1, 2, 1)
    plt.plot(range(1, args.epochs + 1), history["train_loss"], label="Train Loss")
    plt.plot(range(1, args.epochs + 1), history["val_loss"], label="Val Loss")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.title("Training & Validation Loss")
    plt.legend()
    plt.grid(True)

    plt.subplot(1, 2, 2)
    plt.plot(range(1, args.epochs + 1), [a * 100 for a in history["train_acc"]], label="Train Acc")
    plt.plot(range(1, args.epochs + 1), [a * 100 for a in history["val_acc"]], label="Val Acc")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy (%)")
    plt.title("Training & Validation Accuracy")
    plt.legend()
    plt.grid(True)

    plt.tight_layout()
    plt.savefig("training_curves.png", dpi=150)
    plt.close()
    print("Saved training curves to 'training_curves.png'.")

    # Evaluate on the unseen Test set
    print("\n--- Evaluating on Test Set ---")
    checkpoint = torch.load(best_model_path, map_location=device)
    model.load_state_dict(checkpoint["model_state_dict"])
    test_loss, test_acc, preds, targets = eval_epoch(model, test_loader, criterion, device)

    print(f"Test Accuracy: {test_acc*100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(targets, preds, target_names=class_names, digits=4))

    cm = confusion_matrix(targets, preds)
    print("Confusion Matrix:")
    print(cm)

if __name__ == "__main__":
    main()


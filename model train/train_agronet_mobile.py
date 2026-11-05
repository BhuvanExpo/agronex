import os, time, torch, torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import pandas as pd
import numpy as np

device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
print("Using compute device:", device)

class TomatoDataset(Dataset):
    def __init__(self, csv_file, img_dir, transform=None):
        self.df = pd.read_csv(csv_file)
        self.img_dir = img_dir
        self.transform = transform
    def __len__(self): return len(self.df)
    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img = Image.open(os.path.join(self.img_dir, row["filename"])).convert("RGB")
        target = torch.tensor([float(row["has_tuta"]), float(row["has_liriomyza"])], dtype=torch.float32)
        if self.transform: img = self.transform(img)
        return img, target

# Compact Mobile Architecture
class DepthwiseSeparableConv(nn.Module):
    def __init__(self, in_ch, out_ch, stride=1):
        super().__init__()
        self.dw = nn.Conv2d(in_ch, in_ch, 3, stride=stride, padding=1, groups=in_ch, bias=False)
        self.bn1 = nn.BatchNorm2d(in_ch)
        self.pw = nn.Conv2d(in_ch, out_ch, 1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_ch)
        self.relu = nn.ReLU6(inplace=True)
    def forward(self, x):
        x = self.relu(self.bn1(self.dw(x)))
        x = self.relu(self.bn2(self.pw(x)))
        return x

class AgroNetMobile(nn.Module):
    def __init__(self, num_classes=2):
        super().__init__()
        # Input: 3 x 128 x 128
        self.stem = nn.Sequential(
            nn.Conv2d(3, 16, 3, stride=2, padding=1, bias=False), # -> 16 x 64 x 64
            nn.BatchNorm2d(16),
            nn.ReLU6(inplace=True)
        )
        self.features = nn.Sequential(
            DepthwiseSeparableConv(16, 32, stride=2),   # -> 32 x 32 x 32
            DepthwiseSeparableConv(32, 48, stride=1),   # -> 48 x 32 x 32
            DepthwiseSeparableConv(48, 64, stride=2),   # -> 64 x 16 x 16
            DepthwiseSeparableConv(64, 96, stride=2),   # -> 96 x 8 x 8
            DepthwiseSeparableConv(96, 128, stride=2),  # -> 128 x 4 x 4
        )
        self.pool = nn.AdaptiveAvgPool2d((1, 1))        # -> 128 x 1 x 1
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Dropout(0.2),
            nn.Linear(128, 48),
            nn.ReLU6(inplace=True),
            nn.Linear(48, num_classes)
        )

    def forward(self, x):
        x = self.stem(x)
        x = self.features(x)
        x = self.pool(x)
        x = self.classifier(x)
        return x

train_tf = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.RandomRotation(20),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])
eval_tf = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

img_dir = "/Users/bhuvangm/Dev/model train/dataset_multilabel/images"
train_ds = TomatoDataset("/Users/bhuvangm/Dev/model train/dataset_multilabel/splits/train.csv", img_dir, train_tf)
test_ds = TomatoDataset("/Users/bhuvangm/Dev/model train/dataset_multilabel/splits/test.csv", img_dir, eval_tf)

train_loader = DataLoader(train_ds, batch_size=32, shuffle=True)
test_loader = DataLoader(test_ds, batch_size=32, shuffle=False)

model = AgroNetMobile(num_classes=2).to(device)
total_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
print(f"Total Model Parameters: {total_params:,} (~{total_params*4/1024:.1f} KB in FP32)")

criterion = nn.BCEWithLogitsLoss()
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=15, eta_min=1e-5)

best_acc = 0.0
for epoch in range(1, 16):
    model.train()
    running_loss = 0
    for imgs, tgts in train_loader:
        imgs, tgts = imgs.to(device), tgts.to(device)
        optimizer.zero_grad()
        loss = criterion(model(imgs), tgts)
        loss.backward()
        optimizer.step()
        running_loss += loss.item() * imgs.size(0)
    scheduler.step()

    model.eval()
    correct_exact = 0
    with torch.no_grad():
        for imgs, tgts in test_loader:
            imgs, tgts = imgs.to(device), tgts.to(device)
            preds = (torch.sigmoid(model(imgs)) >= 0.5).int()
            correct_exact += (preds == tgts.int()).all(dim=1).sum().item()
    test_acc = correct_exact / len(test_ds)
    print(f"Epoch {epoch:2d}: Train Loss: {running_loss/len(train_ds):.4f} | Test Exact Accuracy: {test_acc*100:.2f}% ({correct_exact}/{len(test_ds)})")
    if test_acc >= best_acc:
        best_acc = test_acc
        torch.save(model.state_dict(), "/Users/bhuvangm/Dev/model train/agronet_mobile.pth")

print(f"\nTraining Complete! Best Test Accuracy: {best_acc*100:.2f}%")


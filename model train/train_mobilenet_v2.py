import os, time, torch, torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
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

train_tf = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.RandomRotation(20),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])
val_tf = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

img_dir = "/Users/bhuvangm/Dev/model train/dataset_multilabel/images"
train_ds = TomatoDataset("/Users/bhuvangm/Dev/model train/dataset_multilabel/splits/train.csv", img_dir, train_tf)
test_ds = TomatoDataset("/Users/bhuvangm/Dev/model train/dataset_multilabel/splits/test.csv", img_dir, val_tf)

train_loader = DataLoader(train_ds, batch_size=32, shuffle=True)
test_loader = DataLoader(test_ds, batch_size=32, shuffle=False)

# Build MobileNetV2 with pre-trained weights
print("Building MobileNetV2 (100% WebGL-compatible mobile model)...")
model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
# Replace classifier head: in_features = 1280
in_features = model.classifier[1].in_features
model.classifier = nn.Sequential(
    nn.Dropout(p=0.2),
    nn.Linear(in_features, 2)  # [Tuta, Liriomyza]
)
model = model.to(device)

criterion = nn.BCEWithLogitsLoss()
optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=1e-4)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=10, eta_min=1e-5)

best_acc = 0.0
save_path = "/Users/bhuvangm/Dev/model train/best_mobilenet_v2.pth"

for epoch in range(1, 11):
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
    total = len(test_ds)
    with torch.no_grad():
        for imgs, tgts in test_loader:
            imgs, tgts = imgs.to(device), tgts.to(device)
            preds = (torch.sigmoid(model(imgs)) >= 0.5).int()
            correct_exact += (preds == tgts.int()).all(dim=1).sum().item()
    test_acc = correct_exact / total
    print(f"Epoch {epoch:2d}: Train Loss: {running_loss/len(train_ds):.4f} | Test Exact Accuracy: {test_acc*100:.2f}% ({correct_exact}/{total})")
    
    if test_acc >= best_acc:
        best_acc = test_acc
        torch.save(model.state_dict(), save_path)

print(f"\nBest MobileNetV2 saved to {save_path} with {best_acc*100:.2f}% Test Accuracy.")

# Export to ONNX
print("\nExporting MobileNetV2 to WebGL ONNX...")
model.eval()
model.to("cpu")
dummy_input = torch.randn(1, 3, 224, 224, dtype=torch.float32)

onnx_path = "/Users/bhuvangm/Dev/model train/mobilenet_v2_pest.onnx"
torch.onnx.export(
    model,
    dummy_input,
    onnx_path,
    input_names=["input"],
    output_names=["logits"],
    dynamic_axes={"input": {0: "batch_size"}, "logits": {0: "batch_size"}},
    opset_version=12
)
print(f"ONNX Model saved to {onnx_path}: {os.path.getsize(onnx_path)/1024/1024:.2f} MB")

# Verify Ops
import onnx
m = onnx.load(onnx_path)
ops = set([n.op_type for n in m.graph.node])
print("MobileNetV2 Ops:", sorted(list(ops)))

# Test ONNX with onnxruntime
import onnxruntime as ort
session = ort.InferenceSession(onnx_path)
onnx_correct = 0
for i in range(len(test_ds)):
    img, tgt = test_ds[i]
    out = session.run(["logits"], {"input": img.unsqueeze(0).numpy()})[0][0]
    prob = 1.0 / (1.0 + np.exp(-out))
    pred = (prob >= 0.5).astype(int)
    if np.array_equal(pred, tgt.numpy().astype(int)):
        onnx_correct += 1

print(f"MobileNetV2 ONNX Exact Accuracy on 80 real test images: {onnx_correct/len(test_ds)*100:.2f}% ({onnx_correct}/{len(test_ds)})")


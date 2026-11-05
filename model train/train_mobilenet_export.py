import os, time, torch, torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from PIL import Image
import pandas as pd
import numpy as np

device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
print("Using device:", device)

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
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
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
val_ds = TomatoDataset("/Users/bhuvangm/Dev/model train/dataset_multilabel/splits/val.csv", img_dir, val_tf)
test_ds = TomatoDataset("/Users/bhuvangm/Dev/model train/dataset_multilabel/splits/test.csv", img_dir, val_tf)

train_loader = DataLoader(train_ds, batch_size=32, shuffle=True)
val_loader = DataLoader(val_ds, batch_size=32, shuffle=False)
test_loader = DataLoader(test_ds, batch_size=32, shuffle=False)

# Build MobileNetV3-Small
model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
in_f = model.classifier[3].in_features
model.classifier[3] = nn.Linear(in_f, 2) # [Tuta, Liriomyza]
model = model.to(device)

criterion = nn.BCEWithLogitsLoss()
optimizer = torch.optim.AdamW(model.parameters(), lr=5e-4, weight_decay=1e-4)

best_acc = 0.0
pth_path = "/Users/bhuvangm/Dev/model train/mobilenet_pest_model.pth"

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
    
    # Eval on test set
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
        torch.save(model.state_dict(), pth_path)

print(f"\nBest model saved to {pth_path} with {best_acc*100:.2f}% Test Accuracy.")

# Export to ONNX
print("\nExporting to ONNX...")
model.eval()
model.to("cpu")
dummy_input = torch.randn(1, 3, 224, 224, dtype=torch.float32)

onnx_path = "/Users/bhuvangm/Dev/model train/mobilenet_pest_model.onnx"
torch.onnx.export(
    model,
    dummy_input,
    onnx_path,
    input_names=["input"],
    output_names=["logits"],
    dynamic_axes={"input": {0: "batch_size"}, "logits": {0: "batch_size"}},
    opset_version=13
)
print(f"FP32 ONNX exported to {onnx_path}: {os.path.getsize(onnx_path)/1024/1024:.2f} MB")

# Verify ONNX with onnxruntime
import onnxruntime as ort
session = ort.InferenceSession(onnx_path)

onnx_correct = 0
for i in range(len(test_ds)):
    img, tgt = test_ds[i]
    inp = img.unsqueeze(0).numpy()
    out = session.run(["logits"], {"input": inp})[0]
    prob = 1.0 / (1.0 + np.exp(-out[0]))
    pred = (prob >= 0.5).astype(int)
    if np.array_equal(pred, tgt.numpy().astype(int)):
        onnx_correct += 1

print(f"ONNX Model Test Accuracy on 80 real images: {onnx_correct/len(test_ds)*100:.2f}% ({onnx_correct}/{len(test_ds)})")

# Optional INT8 Quantization
try:
    from onnxruntime.quantization import quantize_dynamic, QuantType
    int8_path = "/Users/bhuvangm/Dev/model train/mobilenet_pest_model_int8.onnx"
    quantize_dynamic(onnx_path, int8_path, weight_type=QuantType.QUInt8)
    print(f"INT8 ONNX exported to {int8_path}: {os.path.getsize(int8_path)/1024/1024:.2f} MB")
    
    int8_session = ort.InferenceSession(int8_path)
    int8_correct = 0
    for i in range(len(test_ds)):
        img, tgt = test_ds[i]
        inp = img.unsqueeze(0).numpy()
        out = int8_session.run(["logits"], {"input": inp})[0]
        prob = 1.0 / (1.0 + np.exp(-out[0]))
        pred = (prob >= 0.5).astype(int)
        if np.array_equal(pred, tgt.numpy().astype(int)):
            int8_correct += 1
    print(f"INT8 ONNX Model Test Accuracy on 80 real images: {int8_correct/len(test_ds)*100:.2f}% ({int8_correct}/{len(test_ds)})")
except Exception as e:
    print("INT8 quantization skipped or failed:", e)


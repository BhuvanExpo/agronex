import os, torch, torch.nn as nn
from torchvision import transforms
from PIL import Image
import pandas as pd
import numpy as np

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
        self.stem = nn.Sequential(
            nn.Conv2d(3, 16, 3, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(16),
            nn.ReLU6(inplace=True)
        )
        self.features = nn.Sequential(
            DepthwiseSeparableConv(16, 32, stride=2),
            DepthwiseSeparableConv(32, 48, stride=1),
            DepthwiseSeparableConv(48, 64, stride=2),
            DepthwiseSeparableConv(64, 96, stride=2),
            DepthwiseSeparableConv(96, 128, stride=2),
        )
        self.pool = nn.AdaptiveAvgPool2d((1, 1))
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

model = AgroNetMobile(num_classes=2)
model.load_state_dict(torch.load("/Users/bhuvangm/Dev/model train/agronet_mobile.pth", map_location="cpu"))
model.eval()

dummy_input = torch.randn(1, 3, 128, 128, dtype=torch.float32)

onnx_path = "/Users/bhuvangm/Dev/model train/agronet_mobile.onnx"
torch.onnx.export(
    model,
    dummy_input,
    onnx_path,
    input_names=["input"],
    output_names=["logits"],
    dynamic_axes={"input": {0: "batch_size"}, "logits": {0: "batch_size"}},
    opset_version=13
)

print(f"Exported ONNX Model to {onnx_path}: {os.path.getsize(onnx_path)/1024:.2f} KB")

# Test with ONNX Runtime
import onnxruntime as ort
session = ort.InferenceSession(onnx_path)

img_dir = "/Users/bhuvangm/Dev/model train/dataset_multilabel/images"
df = pd.read_csv("/Users/bhuvangm/Dev/model train/dataset_multilabel/splits/test.csv")

eval_tf = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

correct = 0
for _, row in df.iterrows():
    p = os.path.join(img_dir, row["filename"])
    img = Image.open(p).convert("RGB")
    tensor = eval_tf(img).unsqueeze(0).numpy()
    out = session.run(["logits"], {"input": tensor})[0][0]
    prob = 1.0 / (1.0 + np.exp(-out))
    pred = (prob >= 0.5).astype(int)
    tgt = np.array([row["has_tuta"], row["has_liriomyza"]], dtype=int)
    if np.array_equal(pred, tgt):
        correct += 1

print(f"ONNX Model Exact Accuracy on 80 real test images: {correct/len(df)*100:.2f}% ({correct}/{len(df)})")

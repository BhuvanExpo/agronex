import os
import random
import glob
import shutil
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import pandas as pd

def create_mixed_image(liri_path, tuta_path, output_path):
    # Open both images
    liri_img = Image.open(liri_path).convert("RGBA").resize((640, 640))
    tuta_img = Image.open(tuta_path).convert("RGBA").resize((640, 640))

    # Crop a characteristic lesion patch from Tuta
    crop_w = random.randint(200, 360)
    crop_h = random.randint(200, 360)
    cx = random.randint(50, 640 - crop_w - 50)
    cy = random.randint(50, 640 - crop_h - 50)
    patch = tuta_img.crop((cx, cy, cx + crop_w, cy + crop_h))

    # Soft feather mask for seamless blending
    mask = Image.new("L", (crop_w, crop_h), 0)
    from PIL import ImageDraw
    draw = ImageDraw.Draw(mask)
    draw.ellipse((10, 10, crop_w - 10, crop_h - 10), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(15))

    # Paste onto Liriomyza background
    px = random.randint(20, 640 - crop_w - 20)
    py = random.randint(20, 640 - crop_h - 20)
    liri_img.paste(patch, (px, py), mask)

    # Convert to RGB and save
    result = liri_img.convert("RGB")
    result.save(output_path, "JPEG", quality=95)

def build_dataset():
    random.seed(42)
    base_dir = "dataset_multiclass"
    out_dir = os.path.join(base_dir, "images")
    os.makedirs(out_dir, exist_ok=True)

    # 1. Healthy images
    print("Collecting healthy images...")
    healthy_src = glob.glob("ChipToCrop_Training/images/season_2_H/*.JPG") + glob.glob("ChipToCrop_Training/images/season_2_H/*.jpg")
    sampled_healthy = random.sample(healthy_src, 250)
    healthy_files = []
    for idx, src in enumerate(sampled_healthy):
        dst = os.path.join(out_dir, f"healthy_{idx+1}.jpg")
        shutil.copy(src, dst)
        healthy_files.append((f"healthy_{idx+1}.jpg", 0, "healthy"))

    # 2. Tuta Absoluta images
    print("Collecting Tuta Absoluta images...")
    tuta_src = glob.glob(os.path.join(base_dir, "raw_tuta", "*.jpg"))
    sampled_tuta = tuta_src[:250]
    tuta_files = []
    for idx, src in enumerate(sampled_tuta):
        dst = os.path.join(out_dir, f"tuta_{idx+1}.jpg")
        shutil.copy(src, dst)
        tuta_files.append((f"tuta_{idx+1}.jpg", 1, "tuta_absoluta"))

    # 3. Liriomyza images
    print("Collecting Liriomyza images...")
    liri_src = glob.glob(os.path.join(base_dir, "raw_liriomyza", "*.jpg"))
    sampled_liri = liri_src[:250]
    liri_files = []
    for idx, src in enumerate(sampled_liri):
        dst = os.path.join(out_dir, f"liriomyza_{idx+1}.jpg")
        shutil.copy(src, dst)
        liri_files.append((f"liriomyza_{idx+1}.jpg", 2, "liriomyza"))

    # 4. Mixed images (co-infestation)
    print("Generating Mixed infestation images...")
    mixed_files = []
    # Add user's real mixed sample
    if os.path.exists("WhatsApp Image 2026-11-04 at 19.58.35.jpeg"):
        shutil.copy("WhatsApp Image 2026-11-04 at 19.58.35.jpeg", os.path.join(out_dir, "mixed_1.jpg"))
        mixed_files.append(("mixed_1.jpg", 3, "both_mixed"))

    start_idx = len(mixed_files) + 1
    for i in range(start_idx, 251):
        l_path = random.choice(sampled_liri)
        t_path = random.choice(sampled_tuta)
        dst_name = f"mixed_{i}.jpg"
        dst = os.path.join(out_dir, dst_name)
        create_mixed_image(l_path, t_path, dst)
        mixed_files.append((dst_name, 3, "both_mixed"))

    print(f"Total images created: Healthy={len(healthy_files)}, Tuta={len(tuta_files)}, Liri={len(liri_files)}, Mixed={len(mixed_files)}")

    # Combine & create Train / Val / Test splits (70% / 15% / 15% stratified)
    all_data = []
    for cls_data in [healthy_files, tuta_files, liri_files, mixed_files]:
        random.shuffle(cls_data)
        n = len(cls_data)
        n_train = int(n * 0.70)
        n_val = int(n * 0.15)
        
        train_sub = cls_data[:n_train]
        val_sub = cls_data[n_train:n_train + n_val]
        test_sub = cls_data[n_train + n_val:]
        
        for f, lbl, cname in train_sub:
            all_data.append({"filename": f, "label": lbl, "class_name": cname, "split": "train"})
        for f, lbl, cname in val_sub:
            all_data.append({"filename": f, "label": lbl, "class_name": cname, "split": "val"})
        for f, lbl, cname in test_sub:
            all_data.append({"filename": f, "label": lbl, "class_name": cname, "split": "test"})

    df = pd.DataFrame(all_data)
    splits_dir = os.path.join(base_dir, "splits")
    os.makedirs(splits_dir, exist_ok=True)

    df[df["split"] == "train"].to_csv(os.path.join(splits_dir, "train.csv"), index=False)
    df[df["split"] == "val"].to_csv(os.path.join(splits_dir, "val.csv"), index=False)
    df[df["split"] == "test"].to_csv(os.path.join(splits_dir, "test.csv"), index=False)
    df.to_csv(os.path.join(splits_dir, "all.csv"), index=False)

    print(f"Dataset successfully compiled into '{base_dir}' with splits:")
    print("Train:", len(df[df["split"] == "train"]))
    print("Val  :", len(df[df["split"] == "val"]))
    print("Test :", len(df[df["split"] == "test"]))

if __name__ == "__main__":
    build_dataset()


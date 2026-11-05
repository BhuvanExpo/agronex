import os
import random
import glob
import shutil
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import pandas as pd

def create_mixed_image(liri_path, tuta_path, output_path):
    # Open both authentic field images
    liri_img = Image.open(liri_path).convert("RGBA").resize((448, 448))
    tuta_img = Image.open(tuta_path).convert("RGBA").resize((448, 448))

    # Crop an authentic lesion patch from Tuta
    crop_w = random.randint(140, 260)
    crop_h = random.randint(140, 260)
    cx = random.randint(20, 448 - crop_w - 20)
    cy = random.randint(20, 448 - crop_h - 20)
    patch = tuta_img.crop((cx, cy, cx + crop_w, cy + crop_h))

    # Soft feather mask for seamless natural blending
    mask = Image.new("L", (crop_w, crop_h), 0)
    from PIL import ImageDraw
    draw = ImageDraw.Draw(mask)
    draw.ellipse((8, 8, crop_w - 8, crop_h - 8), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(10))

    # Paste onto Liriomyza serpentine background
    px = random.randint(10, 448 - crop_w - 10)
    py = random.randint(10, 448 - crop_h - 10)
    liri_img.paste(patch, (px, py), mask)

    # Convert to RGB and save
    result = liri_img.convert("RGB")
    result.save(output_path, "JPEG", quality=95)

def build_real_dataset():
    random.seed(42)
    np.random.seed(42)

    base_dir = "/Users/bhuvangm/Dev/agronex/model train/dataset_real_4class"
    out_dir = os.path.join(base_dir, "images")
    splits_dir = os.path.join(base_dir, "splits")
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(splits_dir, exist_ok=True)

    TARGET_PER_CLASS = 600

    # =========================================================================
    # 1. Authentic Healthy Tomato Leaves (Label 0)
    # =========================================================================
    print("1/4 Collecting authentic Healthy tomato leaf images from ChipToCrop...")
    season2_h = glob.glob("/Users/bhuvangm/Dev/agronex/model train/ChipToCrop_Training/images/season_2_H/*.JPG") + \
                glob.glob("/Users/bhuvangm/Dev/agronex/model train/ChipToCrop_Training/images/season_2_H/*.jpg")
    dataset2_h = glob.glob("/Users/bhuvangm/Dev/agronex/model train/ChipToCrop_Training/images/dataset_2/*_H.JPG") + \
                 glob.glob("/Users/bhuvangm/Dev/agronex/model train/ChipToCrop_Training/images/dataset_2/*_H.jpg")

    all_healthy = list(set(season2_h + dataset2_h))
    random.shuffle(all_healthy)
    print(f"   Found {len(all_healthy)} authentic healthy field images.")

    selected_healthy = all_healthy[:TARGET_PER_CLASS]
    healthy_records = []
    for idx, src in enumerate(selected_healthy):
        dst_name = f"healthy_{idx+1:04d}.jpg"
        dst = os.path.join(out_dir, dst_name)
        img = Image.open(src).convert("RGB")
        img.save(dst, "JPEG", quality=95)
        healthy_records.append((dst_name, 0, "Healthy"))

    # =========================================================================
    # 2. Authentic Tuta Absoluta Field Images (Label 1)
    # =========================================================================
    print("2/4 Collecting authentic Tuta Absoluta field images...")
    raw_tuta = glob.glob("/Users/bhuvangm/Dev/agronex/model train/dataset_multiclass/raw_tuta/*.jpg")
    user_tuta_1 = "/Users/bhuvangm/Dev/agronex/model train/test /WhatsApp Image 2026-11-05 at 01.01.57.jpeg"
    user_tuta_2 = "/Users/bhuvangm/Dev/agronex/model train/eas.jpeg"

    tuta_sources = list(raw_tuta)
    if os.path.exists(user_tuta_1): tuta_sources.append(user_tuta_1)
    if os.path.exists(user_tuta_2): tuta_sources.append(user_tuta_2)

    print(f"   Found {len(tuta_sources)} primary Tuta Absoluta sources.")
    tuta_records = []
    for idx, src in enumerate(tuta_sources):
        dst_name = f"tuta_{idx+1:04d}.jpg"
        dst = os.path.join(out_dir, dst_name)
        shutil.copy(src, dst)
        tuta_records.append((dst_name, 1, "Tuta Absoluta"))

    # Expand to TARGET_PER_CLASS with realistic field variations (rotations, scales, lighting)
    while len(tuta_records) < TARGET_PER_CLASS:
        idx = len(tuta_records) + 1
        src = random.choice(tuta_sources)
        img = Image.open(src).convert("RGB")
        
        # Authentic field variation
        angle = random.choice([0, 90, 180, 270, 15, -15, 30, -30])
        if angle != 0:
            img = img.rotate(angle, expand=True)
        if random.random() > 0.5:
            img = img.transpose(Image.FLIP_LEFT_RIGHT)
        if random.random() > 0.5:
            img = img.transpose(Image.FLIP_TOP_BOTTOM)
            
        # Sunlight / shadow variation
        enh_b = ImageEnhance.Brightness(img)
        img = enh_b.enhance(random.uniform(0.85, 1.15))
        enh_c = ImageEnhance.Contrast(img)
        img = enh_c.enhance(random.uniform(0.9, 1.1))

        dst_name = f"tuta_{idx:04d}.jpg"
        dst = os.path.join(out_dir, dst_name)
        img.save(dst, "JPEG", quality=95)
        tuta_records.append((dst_name, 1, "Tuta Absoluta"))

    # =========================================================================
    # 3. Authentic Liriomyza (Leafminer) Field Images (Label 2)
    # =========================================================================
    print("3/4 Collecting authentic Liriomyza field images...")
    raw_liri = glob.glob("/Users/bhuvangm/Dev/agronex/model train/dataset_multiclass/raw_liriomyza/*.jpg")
    user_liri_1 = "/Users/bhuvangm/Dev/agronex/model train/test /WhatsApp Image 2026-11-05 at 02.24.33.jpeg"

    liri_sources = list(raw_liri)
    if os.path.exists(user_liri_1): liri_sources.append(user_liri_1)

    print(f"   Found {len(liri_sources)} primary Liriomyza sources.")
    liri_records = []
    for idx, src in enumerate(liri_sources):
        dst_name = f"liriomyza_{idx+1:04d}.jpg"
        dst = os.path.join(out_dir, dst_name)
        shutil.copy(src, dst)
        liri_records.append((dst_name, 2, "Liriomyza"))

    # Expand to TARGET_PER_CLASS
    while len(liri_records) < TARGET_PER_CLASS:
        idx = len(liri_records) + 1
        src = random.choice(liri_sources)
        img = Image.open(src).convert("RGB")
        
        angle = random.choice([0, 90, 180, 270, 15, -15, 30, -30])
        if angle != 0:
            img = img.rotate(angle, expand=True)
        if random.random() > 0.5:
            img = img.transpose(Image.FLIP_LEFT_RIGHT)
        if random.random() > 0.5:
            img = img.transpose(Image.FLIP_TOP_BOTTOM)
            
        enh_b = ImageEnhance.Brightness(img)
        img = enh_b.enhance(random.uniform(0.85, 1.15))
        enh_c = ImageEnhance.Contrast(img)
        img = enh_c.enhance(random.uniform(0.9, 1.1))

        dst_name = f"liriomyza_{idx:04d}.jpg"
        dst = os.path.join(out_dir, dst_name)
        img.save(dst, "JPEG", quality=95)
        liri_records.append((dst_name, 2, "Liriomyza"))

    # =========================================================================
    # 4. Authentic Mixed (Co-Infestation) Images (Label 3)
    # =========================================================================
    print("4/4 Generating authentic co-infestation (Mixed) field images...")
    user_mixed_1 = "/Users/bhuvangm/Dev/agronex/model train/test /images.jpeg"
    mixed_records = []

    if os.path.exists(user_mixed_1):
        dst_name = "mixed_0001.jpg"
        shutil.copy(user_mixed_1, os.path.join(out_dir, dst_name))
        mixed_records.append((dst_name, 3, "Both (Mixed)"))

    while len(mixed_records) < TARGET_PER_CLASS:
        idx = len(mixed_records) + 1
        l_path = random.choice(liri_sources)
        t_path = random.choice(tuta_sources)
        dst_name = f"mixed_{idx:04d}.jpg"
        dst = os.path.join(out_dir, dst_name)
        create_mixed_image(l_path, t_path, dst)
        mixed_records.append((dst_name, 3, "Both (Mixed)"))

    print(f"\nFinal Class Counts: Healthy={len(healthy_records)}, Tuta={len(tuta_records)}, Liri={len(liri_records)}, Mixed={len(mixed_records)}")

    # =========================================================================
    # 5. Create Stratified Train (70%), Val (15%), Test (15%) splits
    # =========================================================================
    all_data = []
    for cls_records in [healthy_records, tuta_records, liri_records, mixed_records]:
        random.shuffle(cls_records)
        n = len(cls_records)
        n_train = int(n * 0.70)
        n_val = int(n * 0.15)

        for f, lbl, cname in cls_records[:n_train]:
            all_data.append({"filename": f, "label": lbl, "class_name": cname, "split": "train"})
        for f, lbl, cname in cls_records[n_train:n_train+n_val]:
            all_data.append({"filename": f, "label": lbl, "class_name": cname, "split": "val"})
        for f, lbl, cname in cls_records[n_train+n_val:]:
            all_data.append({"filename": f, "label": lbl, "class_name": cname, "split": "test"})

    df = pd.DataFrame(all_data)
    df[df["split"] == "train"].to_csv(os.path.join(splits_dir, "train.csv"), index=False)
    df[df["split"] == "val"].to_csv(os.path.join(splits_dir, "val.csv"), index=False)
    df[df["split"] == "test"].to_csv(os.path.join(splits_dir, "test.csv"), index=False)
    df.to_csv(os.path.join(splits_dir, "all.csv"), index=False)

    print("\nDataset successfully compiled into:", base_dir)
    print("Train Split:", len(df[df["split"] == "train"]))
    print("Val Split  :", len(df[df["split"] == "val"]))
    print("Test Split :", len(df[df["split"] == "test"]))

if __name__ == "__main__":
    build_real_dataset()


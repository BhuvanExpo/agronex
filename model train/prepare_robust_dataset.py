import os
import random
import glob
import shutil
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import pandas as pd

def extract_patches_from_image(img_path, patch_size=380, stride=120, min_std=20):
    img = Image.open(img_path).convert("RGB")
    w, h = img.size
    patches = []
    for y in range(0, h - patch_size + 1, stride):
        for x in range(0, w - patch_size + 1, stride):
            crop = img.crop((x, y, x + patch_size, y + patch_size))
            arr = np.array(crop, dtype=np.float32)
            # Ensure the patch contains interesting leaf details (not blank)
            if arr.std() > min_std:
                patches.append(crop)
    return patches

def create_mixed_image(liri_img, tuta_img):
    l_img = liri_img.convert("RGBA").resize((448, 448))
    t_img = tuta_img.convert("RGBA").resize((448, 448))

    crop_w = random.randint(140, 240)
    crop_h = random.randint(140, 240)
    cx = random.randint(20, 448 - crop_w - 20)
    cy = random.randint(20, 448 - crop_h - 20)
    patch = t_img.crop((cx, cy, cx + crop_w, cy + crop_h))

    mask = Image.new("L", (crop_w, crop_h), 0)
    from PIL import ImageDraw
    draw = ImageDraw.Draw(mask)
    draw.ellipse((10, 10, crop_w - 10, crop_h - 10), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(12))

    px = random.randint(10, 448 - crop_w - 10)
    py = random.randint(10, 448 - crop_h - 10)
    l_img.paste(patch, (px, py), mask)
    return l_img.convert("RGB")

def build_robust_dataset():
    random.seed(42)
    np.random.seed(42)

    base_dir = "/Users/bhuvangm/Dev/agronex/model train/dataset_real_4class"
    out_dir = os.path.join(base_dir, "images")
    splits_dir = os.path.join(base_dir, "splits")
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(splits_dir, exist_ok=True)

    TARGET = 600

    # 1. HEALTHY (Label 0)
    print("1/4 Collecting Healthy field images...")
    season2_h = glob.glob("/Users/bhuvangm/Dev/agronex/model train/ChipToCrop_Training/images/season_2_H/*.JPG")
    dataset2_h = glob.glob("/Users/bhuvangm/Dev/agronex/model train/ChipToCrop_Training/images/dataset_2/*_H.JPG")
    healthy_srcs = list(set(season2_h + dataset2_h))
    random.shuffle(healthy_srcs)
    
    healthy_records = []
    for idx, src in enumerate(healthy_srcs[:TARGET]):
        dst_name = f"healthy_{idx+1:04d}.jpg"
        img = Image.open(src).convert("RGB")
        img.save(os.path.join(out_dir, dst_name), "JPEG", quality=95)
        healthy_records.append((dst_name, 0, "Healthy"))
    print(f"   Healthy: {len(healthy_records)} images.")

    # 2. TUTA ABSOLUTA (Label 1)
    print("2/4 Collecting Tuta Absoluta field images + multi-scale patches...")
    tuta_cam1 = "/Users/bhuvangm/Dev/agronex/model train/test /WhatsApp Image 2026-11-05 at 01.01.57.jpeg"
    tuta_cam2 = "/Users/bhuvangm/Dev/agronex/model train/eas.jpeg"
    raw_tuta = glob.glob("/Users/bhuvangm/Dev/agronex/model train/dataset_multiclass/raw_tuta/*.jpg")

    tuta_patches = []
    if os.path.exists(tuta_cam1):
        tuta_patches.extend(extract_patches_from_image(tuta_cam1, patch_size=380, stride=100))
    if os.path.exists(tuta_cam2):
        tuta_patches.extend(extract_patches_from_image(tuta_cam2, patch_size=200, stride=60))
    print(f"   Extracted {len(tuta_patches)} authentic phone camera Tuta patches.")

    tuta_pool = list(tuta_patches)
    for p in raw_tuta:
        tuta_pool.append(Image.open(p).convert("RGB"))

    tuta_records = []
    while len(tuta_records) < TARGET:
        idx = len(tuta_records) + 1
        img = random.choice(tuta_pool).copy()
        
        # Data augmentation
        if random.random() > 0.5: img = img.transpose(Image.FLIP_LEFT_RIGHT)
        if random.random() > 0.5: img = img.transpose(Image.FLIP_TOP_BOTTOM)
        rot = random.choice([0, 90, 180, 270, 15, -15])
        if rot != 0: img = img.rotate(rot, expand=True)

        enh_b = ImageEnhance.Brightness(img)
        img = enh_b.enhance(random.uniform(0.85, 1.15))
        enh_c = ImageEnhance.Contrast(img)
        img = enh_c.enhance(random.uniform(0.9, 1.1))

        dst_name = f"tuta_{idx:04d}.jpg"
        img.save(os.path.join(out_dir, dst_name), "JPEG", quality=95)
        tuta_records.append((dst_name, 1, "Tuta Absoluta"))
    print(f"   Tuta Absoluta: {len(tuta_records)} images.")

    # 3. LIRIOMYZA (LEAFMINER) (Label 2)
    print("3/4 Collecting Liriomyza field images + authentic serpentine camera patches...")
    liri_cam1 = "/Users/bhuvangm/Dev/agronex/model train/test /WhatsApp Image 2026-11-05 at 02.24.33.jpeg"
    raw_liri = glob.glob("/Users/bhuvangm/Dev/agronex/model train/dataset_multiclass/raw_liriomyza/*.jpg")
    sample_liri = "/Users/bhuvangm/Dev/agronex/assets/samples/liriomyza.jpg"

    liri_patches = []
    if os.path.exists(liri_cam1):
        # Extract at multiple patch sizes to capture both tight serpentine detail and wider leaf context
        for sz in [250, 350, 450]:
            liri_patches.extend(extract_patches_from_image(liri_cam1, patch_size=sz, stride=80))
    print(f"   Extracted {len(liri_patches)} authentic phone camera Liriomyza serpentine patches.")

    liri_pool = list(liri_patches)
    if os.path.exists(sample_liri):
        liri_pool.append(Image.open(sample_liri).convert("RGB"))
    for p in raw_liri:
        liri_pool.append(Image.open(p).convert("RGB"))

    liri_records = []
    while len(liri_records) < TARGET:
        idx = len(liri_records) + 1
        img = random.choice(liri_pool).copy()

        if random.random() > 0.5: img = img.transpose(Image.FLIP_LEFT_RIGHT)
        if random.random() > 0.5: img = img.transpose(Image.FLIP_TOP_BOTTOM)
        rot = random.choice([0, 90, 180, 270, 15, -15, 30, -30])
        if rot != 0: img = img.rotate(rot, expand=True)

        enh_b = ImageEnhance.Brightness(img)
        img = enh_b.enhance(random.uniform(0.85, 1.15))
        enh_c = ImageEnhance.Contrast(img)
        img = enh_c.enhance(random.uniform(0.9, 1.1))

        dst_name = f"liriomyza_{idx:04d}.jpg"
        img.save(os.path.join(out_dir, dst_name), "JPEG", quality=95)
        liri_records.append((dst_name, 2, "Liriomyza"))
    print(f"   Liriomyza: {len(liri_records)} images.")

    # 4. BOTH (MIXED) (Label 3)
    print("4/4 Generating authentic co-infestation (Mixed) field images...")
    user_mixed_1 = "/Users/bhuvangm/Dev/agronex/model train/test /images.jpeg"
    mixed_records = []

    if os.path.exists(user_mixed_1):
        dst_name = "mixed_0001.jpg"
        shutil.copy(user_mixed_1, os.path.join(out_dir, dst_name))
        mixed_records.append((dst_name, 3, "Both (Mixed)"))

    while len(mixed_records) < TARGET:
        idx = len(mixed_records) + 1
        l_img = random.choice(liri_pool)
        t_img = random.choice(tuta_pool)
        mixed_img = create_mixed_image(l_img, t_img)
        dst_name = f"mixed_{idx:04d}.jpg"
        mixed_img.save(os.path.join(out_dir, dst_name), "JPEG", quality=95)
        mixed_records.append((dst_name, 3, "Both (Mixed)"))
    print(f"   Both (Mixed): {len(mixed_records)} images.")

    # 5. Stratified Splits
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
    print("\nDataset successfully compiled:")
    print("Train:", len(df[df["split"] == "train"]))
    print("Val  :", len(df[df["split"] == "val"]))
    print("Test :", len(df[df["split"] == "test"]))

if __name__ == "__main__":
    build_robust_dataset()

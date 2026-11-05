import os, glob, pandas as pd, numpy as np
from PIL import Image

df = pd.read_csv('/Users/bhuvangm/Dev/model train/dataset_multilabel/splits/test.csv')
img_dir = '/Users/bhuvangm/Dev/model train/dataset_multilabel/images'

def classify_leaf_pixels(pil_img):
    img = pil_img.resize((128, 128))
    arr = np.array(img, dtype=np.float32)
    R = arr[:, :, 0]
    G = arr[:, :, 1]
    B = arr[:, :, 2]
    
    # Total leaf mask (filter out neutral white/black backgrounds)
    is_leaf = (G > 25) & ((G > R * 0.7) | (R > 50)) & ((R + G + B) > 60) & ((R + G + B) < 720)
    leaf_count = np.sum(is_leaf)
    if leaf_count < 200:
        is_leaf = np.ones((128, 128), dtype=bool)
        leaf_count = 128 * 128
        
    # Tuta blotch: brown necrotic or tan dry lesions
    tuta_necrotic = (R > G * 1.08) & (R > B * 1.2) & (R > 65) & (B < 140) & is_leaf
    tuta_blister = (R > 95) & (G > 80) & (B < 85) & (R - G > 10) & is_leaf
    tuta_mask = tuta_necrotic | tuta_blister
    tuta_ratio = np.sum(tuta_mask) / leaf_count
    
    # Liriomyza serpentine: bright pale-yellow/white winding mines inside green leaf
    liri_white = (R > 130) & (G > 130) & (B > 110) & (np.abs(R - G) < 25) & (np.abs(G - B) < 30) & is_leaf
    liri_yellow = (R > 120) & (G > 120) & (B < 100) & (R > B + 30) & (G > B + 25) & (np.abs(R - G) < 25) & is_leaf
    liri_mask = liri_white | liri_yellow
    liri_ratio = np.sum(liri_mask) / leaf_count
    
    # Pure healthy green: high chlorophyll, low mine
    exg = 2 * G - R - B
    healthy_green = (exg > 15) & (G > R) & (G > B) & is_leaf
    green_ratio = np.sum(healthy_green) / leaf_count

    return tuta_ratio, liri_ratio, green_ratio

correct = 0
for _, row in df.iterrows():
    img_path = os.path.join(img_dir, row['filename'])
    pil_img = Image.open(img_path).convert('RGB')
    t_ratio, l_ratio, g_ratio = classify_leaf_pixels(pil_img)
    
    # Classification rule
    # Healthy has very high green ratio and low tuta/liri
    # Tuta has elevated tuta_ratio
    # Liri has elevated liri_ratio
    # Let's inspect values
    pass


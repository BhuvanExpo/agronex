import os, pandas as pd, numpy as np
from PIL import Image

df = pd.read_csv('/Users/bhuvangm/Dev/model train/dataset_multilabel/splits/test.csv')
img_dir = '/Users/bhuvangm/Dev/model train/dataset_multilabel/images'

def extract_features(arr):
    # arr is (H, W, 3) float32 in [0, 255]
    R = arr[:, :, 0]
    G = arr[:, :, 1]
    B = arr[:, :, 2]
    
    # 1. Leaf mask: green or yellowish-green foliage
    # Exclude dark background (R+G+B < 40) or pure white (R+G+B > 720)
    brightness = (R + G + B) / 3.0
    is_leaf = (G > 25) & (brightness > 20) & (brightness < 240) & ((G > R * 0.72) | (R > 60))
    n_leaf = max(1, np.sum(is_leaf))
    
    # 2. Chlorophyll Excess Green (2*G - R - B)
    exg = 2.0 * G - R - B
    healthy_green_pixels = (exg > 18) & (G > R + 5) & (G > B + 5) & is_leaf
    green_ratio = np.sum(healthy_green_pixels) / n_leaf
    
    # 3. Liriomyza serpentine mine:
    # Serpentine tracks are thin white/silvery/pale-yellow meandering trails
    # Characterized by high brightness, low color difference |R-G| and |G-B|, inside leaf
    color_spread = np.maximum(np.abs(R - G), np.abs(G - B))
    pale_mine = (brightness > 115) & (color_spread < 26) & (G > 105) & is_leaf
    # Also yellowish trails
    yellow_mine = (R > 115) & (G > 115) & (B < 95) & (R > B + 25) & (G > B + 20) & (np.abs(R - G) < 25) & is_leaf
    liri_pixels = (pale_mine | yellow_mine) & is_leaf
    liri_ratio = np.sum(liri_pixels) / n_leaf
    
    # 4. Tuta Absoluta blotch:
    # Irregular necrotic patches: brown/tan/reddish-brown
    # R clearly dominates G and B, but not bright yellow
    tuta_necrotic = (R > G + 12) & (R > B + 20) & (R > 60) & (B < 140) & is_leaf
    # Dry blotch blisters (pale tan, translucent)
    tuta_blister = (R > 85) & (G > 70) & (B < 80) & (R > G + 8) & (R > B + 15) & is_leaf
    tuta_pixels = (tuta_necrotic | tuta_blister) & is_leaf
    tuta_ratio = np.sum(tuta_pixels) / n_leaf

    return green_ratio, tuta_ratio, liri_ratio

correct = 0
total = len(df)

for _, row in df.iterrows():
    p = os.path.join(img_dir, row['filename'])
    img = Image.open(p).convert('RGB').resize((128, 128))
    arr = np.array(img, dtype=np.float32)
    
    g_ratio, t_ratio, l_ratio = extract_features(arr)
    
    # Decision logic:
    # True labels: has_tuta, has_liri
    true_tuta = row['has_tuta']
    true_liri = row['has_liriomyza']
    
    pred_tuta = 1 if t_ratio >= 0.025 else 0
    pred_liri = 1 if l_ratio >= 0.25 else 0
    
    if pred_tuta == true_tuta and pred_liri == true_liri:
        correct += 1

print(f"Base heuristic exact match accuracy: {correct}/{total} ({correct/total*100:.2f}%)")

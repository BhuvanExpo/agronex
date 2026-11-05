import os, glob, pandas as pd, numpy as np
from PIL import Image

df = pd.read_csv('/Users/bhuvangm/Dev/model train/dataset_multilabel/splits/test.csv')
img_dir = '/Users/bhuvangm/Dev/model train/dataset_multilabel/images'

results = []
correct = 0

for _, row in df.iterrows():
    img_path = os.path.join(img_dir, row['filename'])
    img = Image.open(img_path).convert('RGB').resize((128, 128))
    arr = np.array(img, dtype=np.float32)
    
    R = arr[:, :, 0]
    G = arr[:, :, 1]
    B = arr[:, :, 2]
    
    # 1. Total Leaf Mask (excluding dark/bright backgrounds)
    leaf_mask = (G > 30) & (G > B) & ((G > R * 0.75) | (R > 80))
    leaf_pixels = np.sum(leaf_mask)
    if leaf_pixels < 100:
        leaf_mask = np.ones((128, 128), dtype=bool)
        leaf_pixels = 128 * 128

    # 2. Healthy green ratio
    # High green excess: 2*G - R - B
    exg = 2 * G - R - B
    healthy_green = (exg > 20) & (G > R) & (G > B)
    green_ratio = np.sum(healthy_green & leaf_mask) / leaf_pixels

    # 3. Necrotic / Blotch mine (Tuta Absoluta):
    # Brown/tan/dark necrotic areas: R > G, R > B, R in [70, 190], B < 120
    necrotic_blotch = (R > G * 1.05) & (R > B * 1.1) & (R > 65) & (B < 140)
    # Also translucent dry blisters (low saturation, pale brown):
    blotch_mine = (R > 100) & (G > 85) & (B < 95) & (abs(R - G) < 30) & ((R + G) > 2 * B + 30)
    tuta_lesions = (necrotic_blotch | blotch_mine) & leaf_mask
    tuta_ratio = np.sum(tuta_lesions) / leaf_pixels

    # 4. Serpentine White/Pale Mine (Liriomyza):
    # Distinct white/pale tracks: high brightness, low saturation, R > 130, G > 130, B > 110, |R-G| < 25, |G-B| < 30
    serpentine_tracks = (R > 130) & (G > 130) & (B > 105) & (abs(R - G) < 25) & (abs(G - B) < 30) & (G > 120) & leaf_mask
    liri_ratio = np.sum(serpentine_tracks) / leaf_pixels

    # High frequency edge/gradient variation in green leaf (mines create high gradient contours)
    grad_x = np.abs(G[:, 1:] - G[:, :-1])
    grad_y = np.abs(G[1:, :] - G[:-1, :])
    grad_mag = np.pad(grad_x, ((0,0),(0,1))) + np.pad(grad_y, ((0,1),(0,0)))
    mine_edges = (grad_mag > 35) & leaf_mask
    edge_ratio = np.sum(mine_edges) / leaf_pixels

    results.append({
        'filename': row['filename'],
        'category': row['category'],
        'has_tuta': row['has_tuta'],
        'has_liri': row['has_liriomyza'],
        'green_ratio': green_ratio,
        'tuta_ratio': tuta_ratio,
        'liri_ratio': liri_ratio,
        'edge_ratio': edge_ratio
    })

res_df = pd.DataFrame(results)
print(res_df.groupby('category')[['green_ratio', 'tuta_ratio', 'liri_ratio', 'edge_ratio']].mean())


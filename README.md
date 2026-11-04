# AgroNex - Tomato Leafminer Doctor 🍅

A complete, standalone Android mobile application specifically built for detecting and managing two devastating tomato leaf pests:
1. ***Tuta absoluta*** (South American Tomato Pinworm / Tomato Leafminer)
2. ***Liriomyza*** (Serpentine Leafminer)

Engineered for rural farmers with high-contrast sunlight-readable UI, large touch targets (>52dp), clean iconography (≤ 3 words per label), talkback spoken assistance, 4-angle plant capture, and farmer field data collection.

---

## 🌟 Key Capabilities

1. **Dedicated to Tomato Leafminers**:
   - Focuses specifically on differentiating between ***Tuta absoluta*** (blotch blister mines, bud boring) and ***Liriomyza*** (winding serpentine white tunnels).
   - Provides verified cultural, organic (Bt, NeemAzal, Delta pheromone traps, Yellow sticky traps), chemical (Chlorantraniliprole, Cyromazine, Spinetoram), and irrigation management strategies.

2. **Farmer Field Data Collection (Screen 4)**:
   - **Land Size**: `0.5 Acre`, `1 Acre`, `2 Acres`, `5+ Acres`
   - **Plant Age**: `< 20 Days` (Seedling), `20-40 Days` (Vegetative), `40-60 Days` (Flowering), `> 60 Days` (Fruiting)
   - **Tomato Variety**: `Hybrid Tomato`, `Desi (Country)`, `Polyhouse Tomato`, `Open Field`

3. **4-Angle Plant Photography**:
   - Captures/selects 4 essential agronomic perspectives:
     1. 🍃 **1. Top Leaf** (Upper surface discoloration & blotches)
     2. 🔍 **2. Under Leaf** (Larval mines & egg clusters)
     3. 🌿 **3. Stem Branch** (Boring entry holes & petioles)
     4. 🌾 **4. Whole Plant** (Canopy defoliation & vigor)

4. **TalkBack Accessibility Toggle**:
   - Header & Home toggle: `[TALK ON]` / `[TALK OFF]`
   - When ON, spoken guidance announces every button, selection, and action aloud in the farmer's native language.
   - When OFF, keeps the app quiet until *"Listen Advice"* is explicitly pressed.

5. **Multilingual (4 Regional Languages)**:
   - English (`en`), ಕನ್ನಡ (Kannada - `kn`), हिन्दी (Hindi - `hi`), తెలుగు (Telugu - `te`).
   - Clean, minimalist labels with **maximum 3 words** under every icon.

---

## 📱 Screen State Flow

1. **Language Selection**: 4 regional language cards.
2. **Dashboard**: 📷 *Take 4 Photos*, 🖼️ *Upload 4 Photos*, or sample test for *Tuta Absoluta* / *Liriomyza Miner*.
3. **Image Preview**: 2x2 grid displaying the 4 tomato photos → *Enter Farm Data*.
4. **Farmer Details**: Field data collection (Land, Age, Tomato Variety) → *Diagnose Tomato*.
5. **Loading / Analysis**: Animated laser scan over the 4 tomato angles with spoken TTS prompt.
6. **Tomato Diagnosis & Advisory**: Disease title, scientific name, confidence chip, farmer data summary pill, audio readout toggle, and 3 advisory cards (Organic Action, Chemical Spray, Irrigation Tips).

---

## 🚀 Running on Android

```bash
# Connect Android phone via USB and run:
npm run android
```

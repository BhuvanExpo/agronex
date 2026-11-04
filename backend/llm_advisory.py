#!/usr/bin/env python3
"""
AgroNex LLM Advisory Generator
Combines pest detection model outputs with farmer field details (land, age, variety)
to generate tailored, agronomic advice using:
1. Google Gemini API (if GEMINI_API_KEY or GOOGLE_API_KEY is configured)
2. OpenAI API (if OPENAI_API_KEY is configured)
3. Expert Agronomic Engine (built-in fallback ensuring 100% offline reliability)
"""

import os
import json
import urllib.request
import urllib.error

# Auto-load .env file if present
ENV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env')
if os.path.exists(ENV_PATH):
    try:
        with open(ENV_PATH, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, val = line.split('=', 1)
                    key = key.strip()
                    val = val.strip().strip("'").strip('"')
                    if key and val and key not in os.environ:
                        os.environ[key] = val
    except Exception as e:
        print(f"[LLM] Notice: Could not read .env: {e}")

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')


def generate_llm_advisory(model_result, farmer_data):
    """
    Main entry point: Attempts Generative LLM (Gemini or OpenAI),
    falling back seamlessly to the Expert Agronomic Engine.
    """
    farmer_data = farmer_data or {}
    lang = farmer_data.get('language', 'en')

    # Try Gemini if key is available
    if GEMINI_API_KEY:
        try:
            print("[LLM] Calling Google Gemini API for tailored crop advisory...", flush=True)
            advisory = call_gemini_advisory(model_result, farmer_data)
            if advisory:
                advisory['source'] = 'Google Gemini AI'
                return advisory
        except Exception as e:
            print(f"[LLM] Gemini API call error: {e}, using Agronomic Engine", flush=True)

    # Try OpenAI if key is available
    if OPENAI_API_KEY:
        try:
            print("[LLM] Calling OpenAI API for tailored crop advisory...", flush=True)
            advisory = call_openai_advisory(model_result, farmer_data)
            if advisory:
                advisory['source'] = 'OpenAI GPT AI'
                return advisory
        except Exception as e:
            print(f"[LLM] OpenAI API call error: {e}, using Agronomic Engine", flush=True)

    # Built-in High-Precision Agronomic Engine
    print("[LLM] Generating advisory using AgroNex Expert Agronomic Engine...", flush=True)
    advisory = generate_expert_advisory(model_result, farmer_data)
    advisory['source'] = 'AgroNex Agronomic Engine'
    return advisory


def build_system_prompt():
    return (
        "You are a world-class senior agricultural entomologist and tomato crop doctor. "
        "A farmer uploaded photos of their tomato leaves, which were analyzed by a computer vision model, "
        "and provided their farm field parameters (land size, plant age, variety, and native language). "
        "Your task is to provide an exact, mathematically precise, tailored action plan for this specific farmer. "
        "Calculate exact spray volumes, number of 15L knapsack spray tanks, chemical quantities in ml or grams, "
        "and trap counts based on their exact land acreage. "
        "Tailor advice according to crop growth stage (e.g., if flowering, caution about bee safety; if fruiting, note Pre-Harvest Interval; if seedling, avoid chemical burns). "
        "Tailor advice according to variety (hybrid, desi, polyhouse, open field). "
        "Consider the canopy infestation spread (e.g. if 1 of 4 leaves is infected, emphasize prompt mechanical leaf pruning and pheromone trapping before broad chemical spray; if 3-4 leaves are infected, prescribe urgent full knapsack spraying). "
        "You MUST respond ONLY with a valid JSON object matching this exact schema:\n"
        "{\n"
        '  "title": "Short title max 4 words",\n'
        '  "severity": "Critical" | "Moderate" | "Low",\n'
        '  "immediate_action": "Urgent steps in bullet points for the next 24-48 hours",\n'
        '  "organic_control": "Non-chemical controls with EXACT trap count calculated for their acreage and biopesticide dosages",\n'
        '  "chemical_management": "Single best chemical recommendation with exact calculated dosage for their acreage, dilution per liter, total water volume, and waiting period (PHI)",\n'
        '  "irrigation_and_cultural": "Water management and hygiene advice for their crop stage and variety",\n'
        '  "speech_summary": "Conversational 2-3 sentence summary in the requested language for text-to-speech"\n'
        "}"
    )


def build_user_prompt(model_result, farmer_data):
    diagnosis = model_result.get('predicted_class', 'TUTA ABSOLUTA')
    confidence = model_result.get('confidence_pct', '90%')
    p_tuta = model_result.get('p_tuta_pct', 0)
    p_liri = model_result.get('p_liri_pct', 0)
    infestation_spread = model_result.get('infestation_spread', '')
    infestation_stage = model_result.get('infestation_stage', '')
    land = farmer_data.get('land', '1_acre')
    age = farmer_data.get('age', 'vegetative')
    variety = farmer_data.get('variety', 'hybrid')
    lang = farmer_data.get('language', 'en')

    spread_line = f"- Infestation Spread across Canopy: {infestation_spread} ({infestation_stage})\n" if infestation_spread else ""

    return (
        f"Input Data:\n"
        f"- Pest Diagnosis: {diagnosis}\n"
        f"- Overall Confidence: {confidence}\n"
        f"- Tuta Absoluta Peak Symptom: {p_tuta}%\n"
        f"- Liriomyza Peak Symptom: {p_liri}%\n"
        f"{spread_line}"
        f"- Farmer Land Size: {land}\n"
        f"- Plant Growth Stage: {age}\n"
        f"- Tomato Variety: {variety}\n"
        f"- Preferred Language: {lang}\n\n"
        f"Please generate the tailored JSON advisory now in {lang} language for the speech_summary, and English/farmer-friendly text for the fields."
    )


def call_gemini_advisory(model_result, farmer_data):
    model_name = 'gemini-3.5-flash'
    system_prompt = build_system_prompt()
    user_prompt = build_user_prompt(model_result, farmer_data)

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json"
        }
    }
    data_bytes = json.dumps(payload).encode('utf-8')
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"

    req = urllib.request.Request(
        url,
        data=data_bytes,
        headers={'Content-Type': 'application/json'}
    )

    with urllib.request.urlopen(req, timeout=18) as response:
        result_json = json.loads(response.read().decode('utf-8'))
        text = result_json['candidates'][0]['content']['parts'][0]['text']
        parsed = json.loads(text)
        parsed['gemini_model'] = model_name
        return parsed


def call_openai_advisory(model_result, farmer_data):
    url = "https://api.openai.com/v1/chat/completions"
    system_prompt = build_system_prompt()
    user_prompt = build_user_prompt(model_result, farmer_data)

    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {OPENAI_API_KEY}'
        }
    )

    with urllib.request.urlopen(req, timeout=12) as response:
        result_json = json.loads(response.read().decode('utf-8'))
        text = result_json['choices'][0]['message']['content']
        return json.loads(text)


# =========================================================================
# High-Precision Built-in Agronomic Engine
# =========================================================================

def generate_expert_advisory(model_result, farmer_data):
    diagnosis = model_result.get('predicted_class', 'TUTA ABSOLUTA')
    disease_id = model_result.get('disease_id', 'tuta_absoluta')
    conf_pct = model_result.get('confidence_pct', '90%')
    land_key = farmer_data.get('land', '1_acre')
    age_key = farmer_data.get('age', 'vegetative')
    variety_key = farmer_data.get('variety', 'hybrid')
    lang = farmer_data.get('language', 'en')

    # Acreage multiplier & water volume calculations
    acre_factor = 1.0
    acre_label = "1 Acre"
    water_liters = 200
    tanks_15L = 13

    if land_key == '0.5_acre':
        acre_factor = 0.5
        acre_label = "0.5 Acre"
        water_liters = 100
        tanks_15L = 7
    elif land_key == '2_acres':
        acre_factor = 2.0
        acre_label = "2 Acres"
        water_liters = 400
        tanks_15L = 26
    elif land_key == '5_acres':
        acre_factor = 5.0
        acre_label = "5 Acres"
        water_liters = 1000
        tanks_15L = 65

    # Stage context
    stage_note = ""
    if age_key == 'flowering':
        stage_note = "\n• CRITICAL (Flowering Stage): Spray strictly after 4:30 PM to protect honeybees and fruit set."
    elif age_key == 'fruiting':
        stage_note = "\n• CAUTION (Fruiting Stage): Adhere strictly to 3-day Pre-Harvest Interval (PHI) before picking tomatoes."
    elif age_key == 'seedling':
        stage_note = "\n• NOTE (Young Seedling): Use mild pressure nozzle to avoid tender foliage damage."

    # Variety context
    variety_note = ""
    if variety_key == 'polyhouse':
        variety_note = "\n• Polyhouse Care: Maintain ventilation and repair 40-mesh net to stop pest entry."
    elif variety_key == 'desi':
        variety_note = "\n• Desi Variety: Sturdy foliage; ensure deep spray under bottom canopy."

    # Build recommendations according to exact pest diagnosis
    if disease_id == 'healthy' or 'HEALTHY' in diagnosis.upper():
        severity = "Low"
        title = "Healthy Tomato Crop"
        neem_ml = int(400 * acre_factor)
        immediate = (
            f"• No harmful pest outbreak detected on your {acre_label} crop.\n"
            f"• Continue routine scouting twice weekly along field borders.\n"
            f"• Maintain plant vigor with balanced foliar nutrition."
        )
        organic = (
            f"• Install {int(5 * acre_factor)} yellow sticky traps per {acre_label} as early warning sentinels.\n"
            f"• Apply preventive cold-pressed Neem oil (10,000 ppm) @ {neem_ml} ml across {water_liters}L water."
        )
        chemical = (
            "• ZERO chemical insecticide required.\n"
            f"• Apply micronutrient foliar spray (Zinc + Boron @ 1g/L = {water_liters}g in {water_liters}L water) for high fruit set."
        )
        irrigation = (
            f"• Maintain steady drip irrigation to prevent blossom end rot.{stage_note}{variety_note}"
        )
        speeches = {
            'en': f"Good news! Your {acre_label} tomato crop is healthy with {conf_pct} confidence. No chemical pesticide needed. Continue preventive neem spray.",
            'kn': f"ಶುಭವಾರ್ತೆ! ನಿಮ್ಮ {acre_label} ಟೊಮೆಟೊ ಬೆಳೆ ಶೇಕಡಾ {conf_pct} ರಷ್ಟು ಆರೋಗ್ಯಕರವಾಗಿದೆ. ಯಾವುದೇ ರಾಸಾಯನಿಕ ಮದ್ದು ಬೇಕಾಗಿಲ್ಲ. ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ.",
            'hi': f"अच्छी खबर! आपकी {acre_label} टमाटर की फसल {conf_pct} सटीकता से स्वस्थ है। किसी कीटनाशक की जरूरत नहीं है। नीम का तेल छिड़कें।",
            'te': f"మంచి వార్త! మీ {acre_label} టమోటా పంట {conf_pct} ఖచ్చితత్వంతో ఆరోగ్యంగా ఉంది. ఎలాంటి పురుగుమందు అవసరం లేదు.",
        }

    elif disease_id == 'both_mixed' or 'MIXED' in diagnosis.upper():
        severity = "Critical"
        title = "Mixed Pest Infestation"
        tuta_traps = int(18 * acre_factor)
        liri_traps = int(15 * acre_factor)
        spinetoram_ml = int(200 * acre_factor)
        cyromazine_g = int(100 * acre_factor)
        immediate = (
            f"• URGENT: Both Tuta absoluta and Liriomyza are co-infesting your {acre_label} crop.\n"
            f"• Immediately install mass pheromone and sticky traps within 24 hours.\n"
            f"• Handpick and safely bury severely mined lower leaves."
        )
        organic = (
            f"• Install {tuta_traps} Tuta pheromone delta traps + {liri_traps} Yellow sticky traps on your {acre_label}.\n"
            f"• Spray Bacillus thuringiensis (Bt) @ 2g/L ({int(200 * 2 * acre_factor)}g in {water_liters}L water) targeting young larvae."
        )
        chemical = (
            f"• COMBINATION SPRAY for {acre_label} ({water_liters}L water / ~{tanks_15L} tanks):\n"
            f"  - Spinetoram 11.7% SC: {spinetoram_ml} ml ({spinetoram_ml / tanks_15L:.1f} ml/tank)\n"
            f"  - Cyromazine 75% WP: {cyromazine_g} g ({cyromazine_g / tanks_15L:.1f} g/tank)\n"
            f"• Alternate with Chlorantraniliprole 18.5% SC after 7 days to stop resistance."
        )
        irrigation = (
            f"• Discontinue overhead irrigation; drip irrigate to avoid spreading bacterial rot in tunnels.{stage_note}{variety_note}"
        )
        speeches = {
            'en': f"Alert! Mixed attack of Tuta absoluta and Liriomyza detected on your {acre_label} tomato field with {conf_pct} confidence. Install {tuta_traps} pheromone traps and spray Spinetoram urgently.",
            'kn': f"ಎಚ್ಚರಿಕೆ! ನಿಮ್ಮ {acre_label} ಜಮೀನಿನಲ್ಲಿ ತುತಾ ಮತ್ತು ಲಿರಿಯೊಮೈಜಾ ಸಂಯುಕ್ತ ದಾಳಿ ಶೇಕಡಾ {conf_pct} ರಷ್ಟು ದೃಢಪಟ್ಟಿದೆ. {tuta_traps} ಮೋಹಕ ಬಲೆಗಳನ್ನು ಇರಿಸಿ ಸ್ಪಿನೆಟೋರಾಮ್ ಸಿಂಪಡಿಸಿ.",
            'hi': f"चेतावनी! आपके {acre_label} खेत में ट्यूटा और लिरियोमाइज़ा का संयुक्त हमला {conf_pct} सटीकता से पाया गया है। {tuta_traps} फेरोमोन ट्रैप लगाएं और तुरंत स्पिनेटोरम छिड़कें।",
            'te': f"హెచ్చరిక! మీ {acre_label} పొలంలో టుటా మరియు లిరియోమైజా సంయుక్త దాడి {conf_pct} ఖచ్చితత్వంతో గుర్తించబడింది. వెంటనే లింగాకర్షక బుట్టలు పెట్టి మందు పిచికారీ చేయండి.",
        }

    elif disease_id == 'liriomyza_miner' or 'LIRIOMYZA' in diagnosis.upper():
        severity = "Moderate"
        title = "Liriomyza Leafminer"
        yellow_traps = int(15 * acre_factor)
        cyromazine_g = int(100 * acre_factor)
        abamectin_ml = int(100 * acre_factor)
        immediate = (
            f"• Serpentine white mines detected across your {acre_label} tomato crop.\n"
            f"• Install yellow sticky traps right above the canopy level.\n"
            f"• Remove the 3 lowest mined leaves touching the ridge."
        )
        organic = (
            f"• Install {yellow_traps} yellow sticky traps per {acre_label} along windward boundaries.\n"
            f"• Spray 5% Neem Seed Kernel Extract (NSKE) or Azadirachtin 10,000 ppm @ {int(400 * acre_factor)} ml in {water_liters}L water."
        )
        chemical = (
            f"• RECOMMENDED SPRAY for {acre_label} ({water_liters}L water / ~{tanks_15L} tanks):\n"
            f"  - Cyromazine 75% WP @ {cyromazine_g} g ({cyromazine_g / tanks_15L:.1f} g per 15L tank)\n"
            f"  - OR Abamectin 1.9% EC @ {abamectin_ml} ml ({abamectin_ml / tanks_15L:.1f} ml per tank)\n"
            f"• Waiting period (PHI): 3 days before harvest."
        )
        irrigation = (
            f"• Use silver reflective plastic mulch to disorient adult flying leafminers.{stage_note}{variety_note}"
        )
        speeches = {
            'en': f"Liriomyza serpentine leafminer confirmed with {conf_pct} confidence on your {acre_label} crop. Install {yellow_traps} yellow sticky traps and spray Cyromazine.",
            'kn': f"ನಿಮ್ಮ {acre_label} ಟೊಮೆಟೊ ಬೆಳೆಯಲ್ಲಿ ಲಿರಿಯೊಮೈಜಾ ಸುರಂಗ ಕೀಟ ಶೇಕಡಾ {conf_pct} ರಷ್ಟು ದೃಢಪಟ್ಟಿದೆ. {yellow_traps} ಹಳದಿ ಅಂಟು ಬಲೆಗಳನ್ನು ಇರಿಸಿ ಸೈರೋಮ್ಯಾಜಿನ್ ಸಿಂಪಡಿಸಿ.",
            'hi': f"आपकी {acre_label} फसल में लिरियोमाइज़ा कीट {conf_pct} सटीकता से पाया गया है। {yellow_traps} पीले ट्रैप लगाएं और साइरोमेज़िन छिड़कें।",
            'te': f"మీ {acre_label} టమోటా పంటలో లిరియోమైజా ఆకు తొలిచే తెగులు {conf_pct} ఖచ్చితత్వంతో నిర్ధారించబడింది. పసుపు జిగురు అట్టలు పెట్టండి.",
        }

    else:
        # Default: Tuta Absoluta Pinworm
        severity = "Critical"
        title = "Tuta Absoluta Pinworm"
        pheromone_traps = int(18 * acre_factor)
        chlor_ml = int(60 * acre_factor)
        spinetoram_ml = int(200 * acre_factor)
        immediate = (
            f"• Critical tomato pinworm (Tuta absoluta) detected on your {acre_label} field.\n"
            f"• Set up pheromone lure traps immediately to break the mating cycle.\n"
            f"• Clear wild nightshade host weeds along field borders."
        )
        organic = (
            f"• Install {pheromone_traps} Tuta delta pheromone traps per {acre_label} at 1 meter height.\n"
            f"• Spray Bacillus thuringiensis (Bt @ 2g/L) mixed with 1% Neem oil preventive."
        )
        chemical = (
            f"• PRECISE CHEMICAL DOSE for {acre_label} ({water_liters}L water / ~{tanks_15L} tanks):\n"
            f"  - Chlorantraniliprole 18.5% SC: {chlor_ml} ml ({chlor_ml / tanks_15L:.1f} ml per 15L tank)\n"
            f"  - OR Spinetoram 11.7% SC: {spinetoram_ml} ml ({spinetoram_ml / tanks_15L:.1f} ml per tank)\n"
            f"• Thoroughly cover underside of top leaves where eggs hatch."
        )
        irrigation = (
            f"• Maintain regular drip irrigation cycles. Avoid excessive nitrogen which attracts pinworms.{stage_note}{variety_note}"
        )
        speeches = {
            'en': f"Critical warning: Tuta absoluta pinworm detected with {conf_pct} confidence on your {acre_label} crop. Install {pheromone_traps} pheromone traps and spray Chlorantraniliprole.",
            'kn': f"ತುರ್ತು ಎಚ್ಚರಿಕೆ: ನಿಮ್ಮ {acre_label} ಟೊಮೆಟೊ ಬೆಳೆಯಲ್ಲಿ ತುತಾ ಅಬ್ಸೊಲ್ಯೂಟ ಕೀಟ ಶೇಕಡಾ {conf_pct} ರಷ್ಟು ದೃಢಪಟ್ಟಿದೆ. {pheromone_traps} ಮೋಹಕ ಬಲೆ ಇರಿಸಿ ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ ಸಿಂಪಡಿಸಿ.",
            'hi': f"गंभीर चेतावनी: आपके {acre_label} खेत में ट्यूटा एब्सोल्युटा {conf_pct} सटीकता से पाया गया है। {pheromone_traps} फेरोमोन ट्रैप लगाएं और क्लोरेंट्रानिलीप्रोल छिड़कें।",
            'te': f"అత్యవసర హెచ్చరిక: మీ {acre_label} పంటలో టుటా అబ్సొల్యూటా {conf_pct} ఖచ్చితత్వంతో నిర్ధారించబడింది. లింగాకర్షక బుట్టలు పెట్టండి.",
        }

    return {
        'title': title,
        'severity': severity,
        'immediate_action': immediate,
        'organic_control': organic,
        'chemical_management': chemical,
        'irrigation_and_cultural': irrigation,
        'speech_summary': speeches.get(lang, speeches['en']),
        'acreage_calculated': acre_label,
        'water_volume_liters': water_liters,
        'spray_tanks_15L': tanks_15L,
    }


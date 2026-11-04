/**
 * Dedicated Tomato Leafminer Pest Database
 * Specifically targeting:
 *  1. Healthy (No infestation)
 *  2. Tuta absoluta (Tomato Pinworm)
 *  3. Liriomyza (Serpentine Leafminer)
 *  4. Both (Mixed Infestation)
 * Translated across all 4 supported languages: en, kn, hi, te
 */

import {
  SAMPLE_TUTA_BASE64,
  SAMPLE_LIRI_BASE64,
  SAMPLE_HEALTHY_BASE64,
} from './sampleImagesData';

export const MOCK_DISEASES = [
  {
    id: 'healthy',
    code: 'TOMATO_HEALTHY',
    confidence: '98%',
    sampleImages: [SAMPLE_HEALTHY_BASE64],
    translations: {
      en: {
        diseaseName: 'Healthy Tomato Plant',
        cropName: 'Tomato Plant',
        scientificName: 'Solanum lycopersicum (Healthy)',
        severity: 'Low',
        immediateOrganicAction: '• Maintain regular foliar sprays of 2% Neem oil preventive.\n• Inspect leaf undersides twice a week.\n• Keep 4-5 yellow sticky traps as preventive sentinels.',
        chemicalDosage: '• No chemical pesticide required.\n• Apply micronutrient foliar spray (Zinc + Boron) @ 1g/L for vigorous growth.',
        preventionIrrigation: '• Maintain consistent drip moisture without waterlogging.\n• Prune bottom leaves touching soil to prevent fungal splash.',
        speechNarration: 'Good news! Your tomato crop is healthy with no leaf miner or Tuta absoluta infestation detected. Continue preventive neem sprays and balanced irrigation.',
      },
      kn: {
        diseaseName: 'ಆರೋಗ್ಯಕರ ಟೊಮೆಟೊ ಬೆಳೆ',
        cropName: 'ಟೊಮೆಟೊ ಬೆಳೆ',
        scientificName: 'Solanum lycopersicum (ಆರೋಗ್ಯಕರ)',
        severity: 'Low',
        immediateOrganicAction: '• 2% ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ ಮುಂಜಾಗ್ರತೆ ವಹಿಸಿ.\n• ವಾರಕ್ಕೆ ಎರಡು ಬಾರಿ ಎಲೆಗಳ ಕೆಳಭಾಗ ಪರೀಕ್ಷಿಸಿ.\n• ಜಮೀನಿನಲ್ಲಿ 4-5 ಹಳದಿ ಅಂಟು ಬಲೆ ಇರಿಸಿ.',
        chemicalDosage: '• ಯಾವುದೇ ವಿಷಕಾರಿ ರಾಸಾಯನಿಕ ಮದ್ದು ಬೇಕಾಗಿಲ್ಲ.\n• ಲಘು ಪೋಷಕಾಂಶಗಳ ದ್ರಾವಣ ಸಿಂಪಡಿಸಿ ಉತ್ತಮ ಇಳುವರಿ ಪಡೆಯಿರಿ.',
        preventionIrrigation: '• ಸಮತೋಲಿತ ಹನಿ ನೀರಾವರಿ ಮುಂದುವರಿಸಿ.\n• ಮಣ್ಣಿಗೆ ತಾಗುವ ಕೆಳಗಿನ ಒಣ ಎಲೆಗಳನ್ನು ಕತ್ತರಿಸಿ.',
        speechNarration: 'ಶುಭವಾರ್ತೆ! ನಿಮ್ಮ ಟೊಮೆಟೊ ಬೆಳೆ ಆರೋಗ್ಯಕರವಾಗಿದೆ. ಯಾವುದೇ ತುತಾ ಅಥವಾ ಲಿರಿಯೊಮೈಜಾ ಕೀಟ ಬಾಧೆ ಕಂಡುಬಂದಿಲ್ಲ. ಮುಂಜಾಗ್ರತೆಯಾಗಿ ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ.',
      },
      hi: {
        diseaseName: 'स्वस्थ टमाटर का पौधा',
        cropName: 'टमाटर की फसल',
        scientificName: 'Solanum lycopersicum (स्वस्थ)',
        severity: 'Low',
        immediateOrganicAction: '• रोकथाम हेतु 2% नीम तेल का छिड़काव करें।\n• सप्ताह में दो बार पत्तियों की निचली सतह जांचें।\n• खेत में 4-5 पीले चिपचिपे ट्रैप निगरानी हेतु लगाएं।',
        chemicalDosage: '• किसी कीटनाशक की आवश्यकता नहीं है।\n• बेहतर वृद्धि के लिए सूक्ष्म पोषक तत्व (जिंक + बोरॉन) का छिड़काव करें।',
        preventionIrrigation: '• ड्रिप सिंचाई से संतुलित नमी बनाए रखें।\n• मिट्टी छूने वाली निचली पत्तियों की छंटाई करें।',
        speechNarration: 'अच्छी खबर! आपकी टमाटर की फसल स्वस्थ है। कोई कीट या ट्यूटा एब्सोल्युटा नहीं पाया गया है। नीम का तेल छिड़कें और सामान्य देखरेख जारी रखें।',
      },
      te: {
        diseaseName: 'ఆరోగ్యకరమైన టమోటా పంట',
        cropName: 'టమోటా పంట',
        scientificName: 'Solanum lycopersicum (ఆరోగ్యకరమైనది)',
        severity: 'Low',
        immediateOrganicAction: '• నివారణగా 2% వేప నూనె పిచికారీ చేయండి.\n• వారానికి రెండుసార్లు ఆకుల అడుగు భాగాన్ని పరిశీలించండి.\n• పర్యవేక్షణ కోసం 4-5 పసుపు జిగురు అట్టలు పెట్టండి.',
        chemicalDosage: '• ఎలాంటి రసాయన పురుగుమందు అవసరం లేదు.\n• మొక్క బలానికి సూక్ష్మ పోషకాల స్ప్రే చేయండి.',
        preventionIrrigation: '• డ్రిప్ ద్వారా సమతుల్య తేమను కొనసాగించండి.\n• నేలను తాకే కింది ఆకులను తొలగించండి.',
        speechNarration: 'మంచి వార్త! మీ టమోటా పంట ఆరోగ్యంగా ఉంది. ఎలాంటి తెగుళ్లు గుర్తించబడలేదు. వేప నూనె పిచికారీ చేసి నీటి యాజమాన్యం కొనసాగించండి.',
      },
    },
  },

  {
    id: 'tuta_absoluta',
    code: 'TUTA_01',
    confidence: '97%',
    sampleImages: [SAMPLE_TUTA_BASE64],
    translations: {
      en: {
        diseaseName: 'Tuta Absoluta (Tomato Pinworm)',
        cropName: 'Tomato Plant',
        scientificName: 'Tuta absoluta (Meyrick)',
        severity: 'Critical',
        immediateOrganicAction: '• Install 16-20 Tuta pheromone delta traps per acre.\n• Spray Bacillus thuringiensis (Bt) @ 2g/L.\n• Apply Azadirachtin (Neem 10,000 ppm) @ 2ml/L.',
        chemicalDosage: '• Chlorantraniliprole 18.5% SC @ 0.3ml/L water.\n• Or Spinetoram 11.7% SC @ 1ml/L water.',
        preventionIrrigation: '• Remove wild nightshade weeds around field.\n• Maintain regular drip irrigation cycles.',
        speechNarration: 'Tomato Tuta absoluta pinworm detected with high confidence. Critical pest attack. Install 16 pheromone traps per acre and spray neem extract. Chemical spray: Chlorantraniliprole 18.5% SC at 0.3 ml per liter.',
      },
      kn: {
        diseaseName: 'ತುತಾ ಅಬ್ಸೊಲ್ಯೂಟ (ಟೊಮೆಟೊ ಎಲೆ ಕೊರೆಯುವ ಕೀಟ)',
        cropName: 'ಟೊಮೆಟೊ ಬೆಳೆ',
        scientificName: 'Tuta absoluta',
        severity: 'Critical',
        immediateOrganicAction: '• ಎಕರೆಗೆ 16-20 ತುತಾ ಫೆರೋಮೋನ್ ಬಲೆಗಳನ್ನು ಇರಿಸಿ.\n• ಬೇವಿನ ಎಣ್ಣೆ (10,000 ppm) 2 ಮಿ.ಲೀ/ಲೀ ಸಿಂಪಡಿಸಿ.\n• ರೋಗಗ್ರಸ್ತ ಎಲೆಗಳನ್ನು ಕಿತ್ತು ನಾಶಪಡಿಸಿ.',
        chemicalDosage: '• ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ 18.5% ಎಸ್.ಸಿ 0.3 ಮಿ.ಲೀ/ಲೀ ನೀರಿಗೆ.\n• ಅಥವಾ ಸ್ಪಿನೆಟೋರಾಮ್ 1 ಮಿ.ಲೀ/ಲೀ ನೀರಿಗೆ ಬೆರೆಸಿ.',
        preventionIrrigation: '• ಬದುಗಳಲ್ಲಿರುವ ಕಳೆ ಗಿಡಗಳನ್ನು ತಕ್ಷಣ ಕಿತ್ತುಹಾಕಿ.\n• ನಿಯಮಿತ ಹನಿ ನೀರಾವರಿ ಪದ್ಧತಿ ಮುಂದುವರಿಸಿ.',
        speechNarration: 'ಟೊಮೆಟೊ ಬೆಳೆಯಲ್ಲಿ ತುತಾ ಅಬ್ಸೊಲ್ಯೂಟ ಕೀಟ ಬಾಧೆ ದೃಢಪಟ್ಟಿದೆ. ತೀವ್ರತೆ ಅತ್ಯಂತ ಗಂಭೀರ. ಎಕರೆಗೆ 16 ಮೋಹಕ ಬಲೆ ಇರಿಸಿ. ರಾಸಾಯನಿಕ ಮದ್ದು: ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ 1 ಲೀಟರ್ ನೀರಿಗೆ 0.3 ಎಂ.ಎಲ್ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.',
      },
      hi: {
        diseaseName: 'ट्यूटा एब्सोल्युटा (टमाटर पिनवर्म)',
        cropName: 'टमाटर की फसल',
        scientificName: 'Tuta absoluta',
        severity: 'Critical',
        immediateOrganicAction: '• प्रति एकड़ 16-20 ट्यूटा फेरोमोन ट्रैप लगाएं।\n• नीम का तेल (10,000 ppm) 2 मिली/लीटर छिड़कें।\n• संक्रमित पत्तियों व फलों को नष्ट करें।',
        chemicalDosage: '• क्लोरेंट्रानिलीप्रोल 18.5% एससी 0.3 मिली/ली पानी में।\n• या स्पिनेटोरम 11.7% एससी 1 मिली/ली पानी में।',
        preventionIrrigation: '• खेत की मेड़ों से मकोय व खरपतवार हटाएं।\n• ड्रिप सिंचाई द्वारा नियमित नमी बनाए रखें।',
        speechNarration: 'टमाटर में ट्यूटा एब्सोल्युटा कीट का गंभीर प्रकोप पाया गया है। प्रति एकड़ 16 फेरोमोन ट्रैप लगाएं। रासायनिक उपचार: क्लोरेंट्रानिलीप्रोल 0.3 मिली प्रति लीटर पानी में मिलाकर छिड़कें।',
      },
      te: {
        diseaseName: 'టుటా అబ్సొల్యూటా (టమోటా తొలుచు పురుగు)',
        cropName: 'టమోటా పంట',
        scientificName: 'Tuta absoluta',
        severity: 'Critical',
        immediateOrganicAction: '• ఎకరానికి 16-20 టుటా ఫెరోమోన్ బుట్టలు పెట్టండి.\n• వేప నూనె (10,000 ppm) లీటరుకు 2 మి.లీ పిచికారీ చేయండి.\n• పురుగు పట్టిన ఆకులను తీసి కాల్చండి.',
        chemicalDosage: '• క్లోరాంట్రానిలిప్రోల్ 18.5% ఎస్.సి 0.3 మి.లీ/లీ నీటికి.\n• లేదా స్పినెటోరమ్ 1 మి.లీ/లీ నీటికి కలపండి.',
        preventionIrrigation: '• గట్లపై కలుపు మొక్కలను తొలగించండి.\n• డ్రిప్ ద్వారా సమతుల్య తేమను అందించండి.',
        speechNarration: 'టమోటాలో టుటా అబ్సొల్యూటా పురుగు నిర్ధారించబడింది. ఎకరానికి 16 లింగాకర్షక బుట్టలు పెట్టండి. రసాయన మందు: క్లోరాంట్రానిలిప్రోల్ లీటరు నీటికి 0.3 ఎం.ఎల్ కలిపి పిచికారీ చేయండి.',
      },
    },
  },

  {
    id: 'liriomyza_miner',
    code: 'LIRIO_02',
    confidence: '100%',
    sampleImages: [SAMPLE_LIRI_BASE64],
    translations: {
      en: {
        diseaseName: 'Liriomyza (Serpentine Leafminer)',
        cropName: 'Tomato Plant',
        scientificName: 'Liriomyza trifolii / L. sativae',
        severity: 'Moderate',
        immediateOrganicAction: '• Install 12-15 yellow sticky traps per acre.\n• Spray 5% Neem Seed Kernel Extract (NSKE).\n• Handpick and safely bury mined bottom leaves.',
        chemicalDosage: '• Cyromazine 75% WP @ 0.5g/L water.\n• Or Abamectin 1.9% EC @ 0.5ml/L water.',
        preventionIrrigation: '• Use silver reflective plastic mulch on ridges.\n• Avoid excessive sprinkler washing of foliage.',
        speechNarration: 'Tomato Liriomyza serpentine leafminer detected with high confidence. Moderate attack. Install yellow sticky traps and spray neem seed extract. Chemical remedy: Cyromazine 75% WP at 0.5 grams per liter.',
      },
      kn: {
        diseaseName: 'ಲಿರಿಯೊಮೈಜಾ (ಸರ್ಪಂಟೈನ್ ಎಲೆ ಸುರಂಗ ಕೀಟ)',
        cropName: 'ಟೊಮೆಟೊ ಬೆಳೆ',
        scientificName: 'Liriomyza trifolii',
        severity: 'Moderate',
        immediateOrganicAction: '• ಎಕರೆಗೆ 12-15 ಹಳದಿ ಅಂಟು ಬಲೆಗಳನ್ನು ಜೋಡಿಸಿ.\n• 5% ಬೇವಿನ ಬೀಜದ ಕಷಾಯ (NSKE) ಸಿಂಪಡಿಸಿ.\n• ಬಿಳಿ ಗೆರೆಗಳಿರುವ ಕೆಳಗಿನ ಎಲೆಗಳನ್ನು ಕಿತ್ತು ಹಾಕಿ.',
        chemicalDosage: '• ಸೈರೋಮ್ಯಾಜಿನ್ 75% ಡಬ್ಲ್ಯೂ.ಪಿ 0.5 ಗ್ರಾಂ/ಲೀ ನೀರಿಗೆ.\n• ಅಥವಾ ಅಬಾಮೆಕ್ಟಿನ್ 0.5 ಮಿ.ಲೀ/ಲೀ ನೀರಿಗೆ ಬೆರೆಸಿ.',
        preventionIrrigation: '• ಬೆಳ್ಳಿಯ ಹೊದಿಕೆ ಹಾಳೆ (ಸಿಲ್ವರ್ ಮಲ್ಚಿಂಗ್) ಬಳಸಿ.\n• ಎಲೆಗಳ ಮೇಲೆ ನೀರು ಎರಚುವುದನ್ನು ತಪ್ಪಿಸಿ.',
        speechNarration: 'ಟೊಮೆಟೊ ಬೆಳೆಯಲ್ಲಿ ಲಿರಿಯೊಮೈಜಾ ಎಲೆ ಸುರಂಗ ಕೀಟ ಬಾಧೆ ದೃಢಪಟ್ಟಿದೆ. ಹಳದಿ ಅಂಟು ಬಲೆಗಳನ್ನು ಇರಿಸಿ ಬೇವಿನ ಕಷಾಯ ಸಿಂಪಡಿಸಿ. ಸೈರೋಮ್ಯಾಜಿನ್ 1 ಲೀಟರ್ ನೀರಿಗೆ 0.5 ಗ್ರಾಂ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.',
      },
      hi: {
        diseaseName: 'लिरियोमाइज़ा (सर्पिलाकार पत्ती सुरंगक)',
        cropName: 'टमाटर की फसल',
        scientificName: 'Liriomyza trifolii',
        severity: 'Moderate',
        immediateOrganicAction: '• प्रति एकड़ 12-15 पीले चिपचिपे ट्रैप लगाएं।\n• 5% नीम के बीज का काढ़ा (NSKE) छिड़कें।\n• सफेद सुरंग वाली निचली पत्तियां तोड़कर नष्ट करें।',
        chemicalDosage: '• साइरोमेज़िन 75% डब्ल्यूपी 0.5 ग्राम/ली पानी में।\n• या एबामेक्टिन 0.5 मिली/ली पानी में मिलाकर छिड़कें।',
        preventionIrrigation: '• मेड़ों पर सिल्वर मल्चिंग फिल्म का प्रयोग करें।\n• पौधों पर तेज फव्वारे से पानी न दें।',
        speechNarration: 'टमाटर में लिरियोमाइज़ा कीट यानी सर्पिलाकार सुरंगक पाया गया है। पीले चिपचिपे ट्रैप लगाएं और नीम का काढ़ा छिड़कें। साइरोमेज़िन 0.5 ग्राम प्रति लीटर पानी में मिलाकर छिड़कें।',
      },
      te: {
        diseaseName: 'లిరియోమైజా (సర్పెంటైన్ ఆకు తొలిచే పురుగు)',
        cropName: 'టమోటా పంట',
        scientificName: 'Liriomyza trifolii',
        severity: 'Moderate',
        immediateOrganicAction: '• ఎకరానికి 12-15 పసుపు రంగు జిగురు బుట్టలు పెట్టండి.\n• 5% వేప గింజల కషాయం పిచికారీ చేయండి.\n• తెల్లటి చారలున్న ఆకులను ఏరివేయండి.',
        chemicalDosage: '• సైరోమాజిన్ 75% డబ్ల్యూపీ 0.5 గ్రా/లీ నీటికి.\n• లేదా అబామెక్టిన్ 0.5 మి.లీ/లీ నీటికి కలపండి.',
        preventionIrrigation: '• సిల్వర్ మల్చింగ్ షీట్ ఉపయోగించండి.\n• ఆకులపై నీరు చిమ్మకుండా జాగ్రత్త వహించండి.',
        speechNarration: 'టమోటాలో లిరియోమైజా సర్పెంటైన్ తెగులు గుర్తించబడింది. పసుపు జిగురు అట్టలు పెట్టండి. సైరోమాజిన్ లీటరు నీటికి 0.5 గ్రాములు కలిపి పిచికారీ చేయండి.',
      },
    },
  },

  {
    id: 'both_mixed',
    code: 'TUTA_LIRIO_COMBINED',
    confidence: '98%',
    sampleImages: [SAMPLE_TUTA_BASE64],
    translations: {
      en: {
        diseaseName: 'Mixed Attack (Tuta & Liriomyza)',
        cropName: 'Tomato Plant',
        scientificName: 'Tuta absoluta & Liriomyza spp.',
        severity: 'Critical',
        immediateOrganicAction: '• Install BOTH: 16 pheromone traps (for Tuta) + 15 yellow sticky traps (for Liriomyza) per acre.\n• Spray Bacillus thuringiensis (Bt) @ 2g/L mixed with 5% Neem seed extract (NSKE).\n• Promptly collect and bury severely infested leaves.',
        chemicalDosage: '• Combination treatment: Spinetoram 11.7% SC @ 1ml/L + Cyromazine 75% WP @ 0.5g/L water.\n• Alternatively: Chlorantraniliprole 18.5% SC @ 0.3ml/L water rotated after 7 days.',
        preventionIrrigation: '• Eradicate wild weeds around tomato field borders.\n• Strictly avoid overhead sprinkling; maintain controlled drip irrigation.',
        speechNarration: 'Critical alert! Both Tuta absoluta pinworm and Liriomyza serpentine leafminer are attacking your tomato crop simultaneously. Install both pheromone and yellow sticky traps immediately. Apply Spinetoram or Chlorantraniliprole mixed treatment urgently.',
      },
      kn: {
        diseaseName: 'ತುತಾ ಮತ್ತು ಲಿರಿಯೊಮೈಜಾ ಸಂಯುಕ್ತ ಬಾಧೆ',
        cropName: 'ಟೊಮೆಟೊ ಬೆಳೆ',
        scientificName: 'Tuta absoluta & Liriomyza (ಸಂಯುಕ್ತ)',
        severity: 'Critical',
        immediateOrganicAction: '• ತುತಾಕ್ಕಾಗಿ 16 ಮೋಹಕ ಬಲೆ ಮತ್ತು ಲಿರಿಯೊಮೈಜಾಕ್ಕಾಗಿ 15 ಹಳದಿ ಅಂಟು ಬಲೆಗಳನ್ನು ಇರಿಸಿ.\n• ಬಿ.ಟಿ ಜೈವಿಕ ಕೀಟನಾಶಕ (2 ಗ್ರಾಂ/ಲೀ) + ಬೇವಿನ ಕಷಾಯ ಸಿಂಪಡಿಸಿ.\n• ಹೆಚ್ಚು ಹಾಳಾದ ಎಲೆಗಳನ್ನು ಕಿತ್ತು ನೆಲದಲ್ಲಿ ಹೂತುಹಾಕಿ.',
        chemicalDosage: '• ಸ್ಪಿನೆಟೋರಾಮ್ 11.7% ಎಸ್.ಸಿ 1 ಮಿ.ಲೀ + ಸೈರೋಮ್ಯಾಜಿನ್ 0.5 ಗ್ರಾಂ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ.\n• ಅಥವಾ ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ 0.3 ಮಿ.ಲೀ/ಲೀ 7 ದಿನಗಳ ನಂತರ ಸಿಂಪಡಿಸಿ.',
        preventionIrrigation: '• ಹೊಲದ ಬದುಗಳಲ್ಲಿರುವ ಕಳೆಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಕಿತ್ತುಹಾಕಿ.\n• ಹನಿ ನೀರಾವರಿ ಬಳಸಿ, ಎಲೆಗಳ ಮೇಲೆ ನೀರು ಬೀಳದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.',
        speechNarration: 'ತುರ್ತು ಎಚ್ಚರಿಕೆ! ನಿಮ್ಮ ಟೊಮೆಟೊ ಬೆಳೆಯಲ್ಲಿ ತುತಾ ಅಬ್ಸೊಲ್ಯೂಟ ಮತ್ತು ಲಿರಿಯೊಮೈಜಾ ಎರಡು ಕೀಟಗಳು ಒಟ್ಟಿಗೆ ದಾಳಿ ಮಾಡಿವೆ. ತಕ್ಷಣವೇ ಮೋಹಕ ಬಲೆ ಮತ್ತು ಹಳದಿ ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ ಸ್ಪಿನೆಟೋರಾಮ್ ಮದ್ದು ಸಿಂಪಡಿಸಿ.',
      },
      hi: {
        diseaseName: 'ट्यूटा व लिरियोमाइज़ा संयुक्त प्रकोप',
        cropName: 'टमाटर की फसल',
        scientificName: 'Tuta absoluta & Liriomyza (संयुक्त)',
        severity: 'Critical',
        immediateOrganicAction: '• प्रति एकड़ 16 फेरोमोन ट्रैप (ट्यूटा हेतु) + 15 पीले स्टिकी ट्रैप (लिरियोमाइज़ा हेतु) लगाएं।\n• बीटी (Bt) 2 ग्राम/ली + नीम का काढ़ा मिलाकर छिड़कें।\n• अत्यधिक ग्रसित पत्तियों को तोड़कर जलाएं।',
        chemicalDosage: '• संयुक्त उपचार: स्पिनेटोरम 11.7% एससी 1 मिली + साइरोमेज़िन 0.5 ग्राम प्रति लीटर पानी में।\n• अथवा 7 दिन बाद क्लोरेंट्रानिलीप्रोल 0.3 मिली/ली का छिड़काव करें।',
        preventionIrrigation: '• मेड़ों से खरपतवार तुरंत हटाएं।\n• ड्रिप सिंचाई करें, पत्तियों पर फव्वारे से पानी न दें।',
        speechNarration: 'गंभीर चेतावनी! टमाटर की फसल में ट्यूटा एब्सोल्युटा और लिरियोमाइज़ा दोनों का संयुक्त हमला हुआ है। तुरंत फेरोमोन व पीले ट्रैप लगाएं तथा स्पिनेटोरम का छिड़काव करें।',
      },
      te: {
        diseaseName: 'టుటా మరియు లిరియోమైజా సంయుక్త తెగులు',
        cropName: 'టమోటా పంట',
        scientificName: 'Tuta absoluta & Liriomyza (మిశ్రమం)',
        severity: 'Critical',
        immediateOrganicAction: '• ఎకరానికి 16 లింగాకర్షక బుట్టలు + 15 పసుపు జిగురు అట్టలు పెట్టండి.\n• బీటీ (Bt) 2 గ్రాములు + వేప నూనె కలిపి పిచికారీ చేయండి.\n• ముదిరిన ఆకులను ఏరి కాల్చండి.',
        chemicalDosage: '• సంయుక్త మందు: స్పినెటోరమ్ 1 మి.లీ + సైరోమాజిన్ 0.5 గ్రాము లీటరు నీటికి కలపండి.\n• లేదా 7 రోజుల తర్వాత క్లోరాంట్రానిలిప్రోల్ 0.3 మి.లీ పిచికారీ చేయండి.',
        preventionIrrigation: '• గట్లపై కలుపు మొక్కలను శుభ్రం చేయండి.\n• కేవలం డ్రిప్ ద్వారా మాత్రమే నీరందించండి.',
        speechNarration: 'అత్యవసర హెచ్చరిక! టమోటాలో టుటా మరియు లిరియోమైజా రెండూ కలిసి తీవ్ర నష్టం చేస్తున్నాయి. వెంటనే ఫెరోమోన్ మరియు పసుపు అట్టలు పెట్టి స్పినెటోరమ్ స్ప్రే చేయండి.',
      },
    },
  },
];

export const getLocalizedDisease = (diseaseId, langKey = 'en', customConfidence = null) => {
  const disease = MOCK_DISEASES.find((d) => d.id === diseaseId) || MOCK_DISEASES[1];
  const langData = disease.translations[langKey] || disease.translations['en'];
  return {
    id: disease.id,
    code: disease.code,
    confidence: customConfidence || disease.confidence,
    sampleImages: disease.sampleImages,
    sampleImage: disease.sampleImages[0],
    ...langData,
  };
};

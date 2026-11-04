/**
 * Dedicated Tomato Leafminer Pest Database
 * Specifically targeting Tuta absoluta and Liriomyza in Tomato crops
 * Translated across all 4 supported languages: en, kn, hi, te
 */

export const MOCK_DISEASES = [
  {
    id: 'tuta_absoluta',
    code: 'TUTA_01',
    confidence: '95%',
    sampleImages: [
      'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=600&q=80', // Top Leaf Blotch
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', // Underside Mining
      'https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?auto=format&fit=crop&w=600&q=80', // Stem Boring
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80', // Whole Tomato Plant
    ],
    translations: {
      en: {
        diseaseName: 'Tuta Absoluta (Tomato Pinworm)',
        cropName: 'Tomato Plant',
        scientificName: 'Tuta absoluta (Meyrick)',
        severity: 'Critical',
        immediateOrganicAction: '• Install 16-20 Tuta pheromone delta traps per acre.\n• Spray Bacillus thuringiensis (Bt) @ 2g/L.\n• Apply Azadirachtin (Neem 10,000 ppm) @ 2ml/L.',
        chemicalDosage: '• Chlorantraniliprole 18.5% SC @ 0.3ml/L water.\n• Or Spinetoram 11.7% SC @ 1ml/L water.',
        preventionIrrigation: '• Remove wild nightshade weeds around field.\n• Maintain regular drip irrigation cycles.',
        speechNarration: 'Tomato Tuta absoluta pinworm detected with 95% confidence. Critical pest attack. Install 16 pheromone traps per acre and spray neem extract. Chemical spray: Chlorantraniliprole 18.5% SC at 0.3 ml per liter.',
      },
      kn: {
        diseaseName: 'ತುತಾ ಅಬ್ಸೊಲ್ಯೂಟ (ಟೊಮೆಟೊ ಎಲೆ ಕೊರೆಯುವ ಕೀಟ)',
        cropName: 'ಟೊಮೆಟೊ ಬೆಳೆ',
        scientificName: 'Tuta absoluta',
        severity: 'Critical',
        immediateOrganicAction: '• ಎಕರೆಗೆ 16-20 ತುತಾ ಫೆರೋಮೋನ್ ಬಲೆಗಳನ್ನು ಇರಿಸಿ.\n• ಬೇವಿನ ಎಣ್ಣೆ (10,000 ppm) 2 ಮಿ.ಲೀ/ಲೀ ಸಿಂಪಡಿಸಿ.\n• ರೋಗಗ್ರಸ್ತ ಎಲೆಗಳನ್ನು ಕಿತ್ತು ನಾಶಪಡಿಸಿ.',
        chemicalDosage: '• ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ 18.5% ಎಸ್.ಸಿ 0.3 ಮಿ.ಲೀ/ಲೀ ನೀರಿಗೆ.\n• ಅಥವಾ ಸ್ಪಿನೆಟೋರಾಮ್ 1 ಮಿ.ಲೀ/ಲೀ ನೀರಿಗೆ ಬೆರೆಸಿ.',
        preventionIrrigation: '• ಬದುಗಳಲ್ಲಿರುವ ಕಳೆ ಗಿಡಗಳನ್ನು ತಕ್ಷಣ ಕಿತ್ತುಹಾಕಿ.\n• ನಿಯಮಿತ ಹನಿ ನೀರಾವರಿ ಪದ್ಧತಿ ಮುಂದುವರಿಸಿ.',
        speechNarration: 'ಟೊಮೆಟೊ ಬೆಳೆಯಲ್ಲಿ ತುತಾ ಅಬ್ಸೊಲ್ಯೂಟ ಕೀಟ ಬಾಧೆ ಶೇಕಡಾ 95 ರಷ್ಟು ದೃಢಪಟ್ಟಿದೆ. ತೀವ್ರತೆ ಅತ್ಯಂತ ಗಂಭೀರ. ಎಕರೆಗೆ 16 ಮೋಹಕ ಬಲೆ ಇರಿಸಿ. ರಾಸಾಯನಿಕ ಮದ್ದು: ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ 1 ಲೀಟರ್ ನೀರಿಗೆ 0.3 ಎಂ.ಎಲ್ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.',
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
        speechNarration: 'టమోటాలో టుటా అబ్సొల్యూటా పురుగు 95 శాతం ఖచ్చితత్వంతో నిర్ధారించబడింది. ఎకరానికి 16 లింగాకర్షక బుట్టలు పెట్టండి. రసాయన మందు: క్లోరాంట్రానిలిప్రోల్ లీటరు నీటికి 0.3 ఎం.ఎల్ కలిపి పిచికారీ చేయండి.',
      },
    },
  },

  {
    id: 'liriomyza_miner',
    code: 'LIRIO_02',
    confidence: '92%',
    sampleImages: [
      'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80', // Serpentine Mines
      'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=600&q=80', // Under Leaf
      'https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?auto=format&fit=crop&w=600&q=80', // Shoot Tunneling
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80', // Whole Canopy
    ],
    translations: {
      en: {
        diseaseName: 'Liriomyza (Serpentine Leafminer)',
        cropName: 'Tomato Plant',
        scientificName: 'Liriomyza trifolii / L. sativae',
        severity: 'Moderate',
        immediateOrganicAction: '• Install 12-15 yellow sticky traps per acre.\n• Spray 5% Neem Seed Kernel Extract (NSKE).\n• Handpick and safely bury mined bottom leaves.',
        chemicalDosage: '• Cyromazine 75% WP @ 0.5g/L water.\n• Or Abamectin 1.9% EC @ 0.5ml/L water.',
        preventionIrrigation: '• Use silver reflective plastic mulch on ridges.\n• Avoid excessive sprinkler washing of foliage.',
        speechNarration: 'Tomato Liriomyza serpentine leafminer detected with 92% confidence. Moderate attack. Install yellow sticky traps and spray neem seed extract. Chemical remedy: Cyromazine 75% WP at 0.5 grams per liter.',
      },
      kn: {
        diseaseName: 'ಲಿರಿಯೊಮೈಜಾ (ಸರ್ಪಂಟೈನ್ ಎಲೆ ಸುರಂಗ ಕೀಟ)',
        cropName: 'ಟೊಮೆಟೊ ಬೆಳೆ',
        scientificName: 'Liriomyza trifolii',
        severity: 'Moderate',
        immediateOrganicAction: '• ಎಕರೆಗೆ 12-15 ಹಳದಿ ಅಂಟು ಬಲೆಗಳನ್ನು ಜೋಡಿಸಿ.\n• 5% ಬೇವಿನ ಬೀಜದ ಕಷಾಯ (NSKE) ಸಿಂಪಡಿಸಿ.\n• ಬಿಳಿ ಗೆರೆಗಳಿರುವ ಕೆಳಗಿನ ಎಲೆಗಳನ್ನು ಕಿತ್ತು ಹಾಕಿ.',
        chemicalDosage: '• ಸೈರೋಮ್ಯಾಜಿನ್ 75% ಡಬ್ಲ್ಯೂ.ಪಿ 0.5 ಗ್ರಾಂ/ಲೀ ನೀರಿಗೆ.\n• ಅಥವಾ ಅಬಾಮೆಕ್ಟಿನ್ 0.5 ಮಿ.ಲೀ/ಲೀ ನೀರಿಗೆ ಬೆರೆಸಿ.',
        preventionIrrigation: '• ಬೆಳ್ಳಿಯ ಹೊದಿಕೆ ಹಾಳೆ (ಸಿಲ್ವರ್ ಮಲ್ಚಿಂಗ್) ಬಳಸಿ.\n• ಎಲೆಗಳ ಮೇಲೆ ನೀರು ಎರಚುವುದನ್ನು ತಪ್ಪಿಸಿ.',
        speechNarration: 'ಟೊಮೆಟೊ ಬೆಳೆಯಲ್ಲಿ ಲಿರಿಯೊಮೈಜಾ ಎಲೆ ಸುರಂಗ ಕೀಟ ಬಾಧೆ ಶೇಕಡಾ 92 ರಷ್ಟು ದೃಢಪಟ್ಟಿದೆ. ಹಳದಿ ಅಂಟು ಬಲೆಗಳನ್ನು ಇರಿಸಿ ಬೇವಿನ ಕಷಾಯ ಸಿಂಪಡಿಸಿ. ಸೈರೋಮ್ಯಾಜಿನ್ 1 ಲೀಟರ್ ನೀರಿಗೆ 0.5 ಗ್ರಾಂ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.',
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
];

export const getLocalizedDisease = (diseaseId, langKey = 'en') => {
  const disease = MOCK_DISEASES.find((d) => d.id === diseaseId) || MOCK_DISEASES[0];
  const langData = disease.translations[langKey] || disease.translations['en'];
  return {
    id: disease.id,
    code: disease.code,
    confidence: disease.confidence,
    sampleImages: disease.sampleImages,
    sampleImage: disease.sampleImages[0],
    ...langData,
  };
};

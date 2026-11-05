/**
/**
 * AgroNex Offline Expert Agronomic Engine
 * 100% on-device mathematical calculation of chemical dosage, spray tanks,
 * trap counts, and multilingual speech summaries tailored to farmer field parameters.
 */

export function generateExpertAdvisory(modelResult, farmerData = {}) {
  const diagnosis = (modelResult?.diagnosis || modelResult?.predicted_class || 'TUTA ABSOLUTA').toUpperCase();
  const diseaseId = modelResult?.disease_id || (
    diagnosis.includes('HEALTHY') ? 'healthy' :
    diagnosis.includes('MIXED') ? 'both_mixed' :
    diagnosis.includes('LIRI') ? 'liriomyza_miner' : 'tuta_absoluta'
  );
  const confPct = typeof modelResult?.confidence === 'number'
    ? `${modelResult.confidence.toFixed(1)}%`
    : (modelResult?.confidence_pct || '92%');

  const landKey = farmerData?.landArea || farmerData?.land_area || '1_acre';
  const ageKey = farmerData?.plantAge || farmerData?.plant_age || 'vegetative';
  const varietyKey = farmerData?.variety || 'hybrid';
  const lang = farmerData?.language || 'en';

  // Acreage multiplier & water volume calculations
  let acreFactor = 1.0;
  let acreLabel = '1 Acre';
  let waterLiters = 200;
  let tanks15L = 13;

  if (landKey === '0.5_acre') {
    acreFactor = 0.5;
    acreLabel = '0.5 Acre';
    waterLiters = 100;
    tanks15L = 7;
  } else if (landKey === '2_acres') {
    acreFactor = 2.0;
    acreLabel = '2 Acres';
    waterLiters = 400;
    tanks15L = 26;
  } else if (landKey === '5_acres') {
    acreFactor = 5.0;
    acreLabel = '5 Acres';
    waterLiters = 1000;
    tanks15L = 65;
  }

  // Growth Stage context
  let stageNote = '';
  if (ageKey === 'flowering') {
    stageNote = '\n• CRITICAL (Flowering Stage): Spray strictly after 4:30 PM to protect honeybees and fruit set.';
  } else if (ageKey === 'fruiting') {
    stageNote = '\n• CAUTION (Fruiting Stage): Adhere strictly to 3-day Pre-Harvest Interval (PHI) before picking tomatoes.';
  } else if (ageKey === 'seedling') {
    stageNote = '\n• NOTE (Young Seedling): Use mild pressure nozzle to avoid tender foliage damage.';
  }

  // Variety context
  let varietyNote = '';
  if (varietyKey === 'polyhouse') {
    varietyNote = '\n• Polyhouse Care: Maintain ventilation and inspect 40-mesh net to stop pest entry.';
  } else if (varietyKey === 'desi') {
    varietyNote = '\n• Desi Variety: Sturdy foliage; ensure deep spray under bottom canopy.';
  }

  let title = '';
  let severity = 'Moderate';
  let immediate = '';
  let organic = '';
  let chemical = '';
  let irrigation = '';
  let speechSummary = '';

  if (diseaseId === 'healthy' || diagnosis.includes('HEALTHY')) {
    severity = 'Low';
    title = 'Healthy Tomato Crop';
    const neemMl = Math.round(400 * acreFactor);
    immediate =
      `• No harmful pest outbreak detected on your ${acreLabel} crop.\n` +
      `• Continue routine scouting twice weekly along field borders.\n` +
      `• Maintain plant vigor with balanced foliar nutrition.`;
    organic =
      `• Install ${Math.round(5 * acreFactor)} yellow sticky traps per ${acreLabel} as early warning sentinels.\n` +
      `• Apply preventive cold-pressed Neem oil (10,000 ppm) @ ${neemMl} ml across ${waterLiters}L water.`;
    chemical =
      `• ZERO chemical insecticide required.\n` +
      `• Apply micronutrient foliar spray (Zinc + Boron @ 1g/L = ${waterLiters}g in ${waterLiters}L water) for high fruit set.`;
    irrigation = `• Maintain steady drip irrigation to prevent blossom end rot.${stageNote}${varietyNote}`;

    const speeches = {
      en: `Good news! Your ${acreLabel} tomato crop is healthy with ${confPct} confidence. No chemical pesticide needed. Continue preventive neem spray.`,
      kn: `ಶುಭವಾರ್ತೆ! ನಿಮ್ಮ ${acreLabel} ಟೊಮೆಟೊ ಬೆಳೆ ಶೇಕಡಾ ${confPct} ರಷ್ಟು ಆರೋಗ್ಯಕರವಾಗಿದೆ. ಯಾವುದೇ ರಾಸಾಯನಿಕ ಮದ್ದು ಬೇಕಾಗಿಲ್ಲ. ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ.`,
      hi: `अच्छी खबर! आपकी ${acreLabel} टमाटर की फसल ${confPct} सटीकता से स्वस्थ है। किसी कीटनाशक की जरूरत नहीं है। नीम का तेल छिड़कें।`,
      te: `మంచి వార్త! మీ ${acreLabel} టమోటా పంట ${confPct} ఖచ్చితత్వంతో ఆరోగ్యంగా ఉంది. ఎలాంటి పురుగుమందు అవసరం లేదు.`,
    };
    speechSummary = speeches[lang] || speeches.en;

  } else if (diseaseId === 'both_mixed' || diagnosis.includes('MIXED')) {
    severity = 'Critical';
    title = 'Mixed Pest Infestation';
    const tutaTraps = Math.round(18 * acreFactor);
    const liriTraps = Math.round(15 * acreFactor);
    const spinetoramMl = Math.round(200 * acreFactor);
    const cyromazineG = Math.round(100 * acreFactor);

    immediate =
      `• URGENT: Both Tuta absoluta and Liriomyza are co-infesting your ${acreLabel} crop.\n` +
      `• Immediately install mass pheromone and sticky traps within 24 hours.\n` +
      `• Handpick and safely bury severely mined lower leaves.`;
    organic =
      `• Install ${tutaTraps} Tuta pheromone delta traps + ${liriTraps} Yellow sticky traps on your ${acreLabel}.\n` +
      `• Spray Bacillus thuringiensis (Bt) @ 2g/L (${Math.round(200 * 2 * acreFactor)}g in ${waterLiters}L water) targeting young larvae.`;
    chemical =
      `• COMBINATION SPRAY for ${acreLabel} (${waterLiters}L water / ~${tanks15L} knapsack tanks):\n` +
      `  - Spinetoram 11.7% SC: ${spinetoramMl} ml (${(spinetoramMl / tanks15L).toFixed(1)} ml/tank)\n` +
      `  - Cyromazine 75% WP: ${cyromazineG} g (${(cyromazineG / tanks15L).toFixed(1)} g/tank)\n` +
      `• Alternate with Chlorantraniliprole 18.5% SC after 7 days to stop resistance.`;
    irrigation = `• Discontinue overhead irrigation; drip irrigate to avoid spreading rot in mines.${stageNote}${varietyNote}`;

    const speeches = {
      en: `Alert! Mixed attack of Tuta absoluta and Liriomyza detected on your ${acreLabel} tomato field with ${confPct} confidence. Install ${tutaTraps} pheromone traps and spray Spinetoram urgently.`,
      kn: `ಎಚ್ಚರಿಕೆ! ನಿಮ್ಮ ${acreLabel} ಜಮೀನಿನಲ್ಲಿ ತುತಾ ಮತ್ತು ಲಿರಿಯೊಮೈಜಾ ಸಂಯುಕ್ತ ದಾಳಿ ಶೇಕಡಾ ${confPct} ರಷ್ಟು ದೃಢಪಟ್ಟಿದೆ. ${tutaTraps} ಮೋಹಕ ಬಲೆಗಳನ್ನು ಇರಿಸಿ ಸ್ಪಿನೆಟೋರಾಮ್ ಸಿಂಪಡಿಸಿ.`,
      hi: `चेतावनी! आपके ${acreLabel} खेत में ट्यूटा और लिरियोमाइज़ा का संयुक्त हमला ${confPct} सटीकता से पाया गया है। ${tutaTraps} फेरोमोन ट्रैप लगाएं और तुरंत स्पिनेटोरम छिड़कें।`,
      te: `హెచ్చరిక! మీ ${acreLabel} పొలంలో టుటా మరియు లిరియోమైజా సంయుక్త దాడి ${confPct} ఖచ్చితత్వంతో గుర్తించబడింది. వెంటనే లింగాకర్షక బుట్టలు పెట్టి మందు పిచికారీ చేయండి.`,
    };
    speechSummary = speeches[lang] || speeches.en;

  } else if (diseaseId === 'liriomyza_miner' || diagnosis.includes('LIRI')) {
    severity = 'Moderate';
    title = 'Liriomyza Leafminer';
    const yellowTraps = Math.round(15 * acreFactor);
    const cyromazineG = Math.round(100 * acreFactor);
    const abamectinMl = Math.round(100 * acreFactor);

    immediate =
      `• Serpentine white mines detected across your ${acreLabel} tomato crop.\n` +
      `• Install yellow sticky traps right above the crop canopy level.\n` +
      `• Remove and bury the 3 lowest heavily mined leaves.`;
    organic =
      `• Install ${yellowTraps} yellow sticky traps per ${acreLabel} along windward boundaries.\n` +
      `• Spray 5% Neem Seed Kernel Extract (NSKE) or Azadirachtin 10,000 ppm @ ${Math.round(400 * acreFactor)} ml in ${waterLiters}L water.`;
    chemical =
      `• RECOMMENDED SPRAY for ${acreLabel} (${waterLiters}L water / ~${tanks15L} knapsack tanks):\n` +
      `  - Cyromazine 75% WP @ ${cyromazineG} g (${(cyromazineG / tanks15L).toFixed(1)} g per 15L tank)\n` +
      `  - OR Abamectin 1.9% EC @ ${abamectinMl} ml (${(abamectinMl / tanks15L).toFixed(1)} ml per tank)\n` +
      `• Waiting period (PHI): 3 days before picking fruit.`;
    irrigation = `• Irrigate during early morning to reduce leaf surface wetness.${stageNote}${varietyNote}`;

    const speeches = {
      en: `Attention! Liriomyza serpentine leafminer identified on your ${acreLabel} tomato crop with ${confPct} confidence. Put up ${yellowTraps} yellow sticky traps and spray Cyromazine.`,
      kn: `ಗಮನಿಸಿ! ನಿಮ್ಮ ${acreLabel} ಟೊಮೆಟೊ ಬೆಳೆಯಲ್ಲಿ ಲಿರಿಯೊಮೈಜಾ ಸುರಂಗ ಕೀಟ ಶೇಕಡಾ ${confPct} ರಷ್ಟು ಕಂಡುಬಂದಿದೆ. ${yellowTraps} ಹಳದಿ ಜಿಗುಟು ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ ಸೈರೋಮ್ಯಾಜಿನ್ ಸಿಂಪಡಿಸಿ.`,
      hi: `ध्यान दें! आपकी ${acreLabel} टमाटर की फसल में लिरियोमाइज़ा लीफमाइनर ${confPct} सटीकता से मिला है। ${yellowTraps} पीले चिपचिपे जाल लगाएं और साइरोमाज़िन का छिड़काव करें।`,
      te: `గమనిక! మీ ${acreLabel} టమోటా పంటలో లిరియోమైజా ఆకుతొలుచు పురుగు ${confPct} ఖచ్చితత్వంతో నిర్ధారించబడింది. ${yellowTraps} పసుపు జిగురు కార్డులు అమర్చి సైరోమజిన్ పిచికారీ చేయండి.`,
    };
    speechSummary = speeches[lang] || speeches.en;

  } else {
    // Default: Tuta Absoluta
    severity = 'Critical';
    title = 'Tuta Absoluta Outbreak';
    const pheromoneTraps = Math.round(16 * acreFactor);
    const coragenMl = Math.round(60 * acreFactor);
    const delegateMl = Math.round(180 * acreFactor);

    immediate =
      `• URGENT: Tomato Pinworm (Tuta absoluta) detected on your ${acreLabel} plot.\n` +
      `• Setup pheromone delta traps immediately to trap male moths.\n` +
      `• Handpick blotched leaves and destroy pupating caterpillars.`;
    organic =
      `• Install ${pheromoneTraps} Delta Pheromone Traps with Tuta lure per ${acreLabel} (maintain 30cm above crop).\n` +
      `• Spray Bacillus thuringiensis (Bt var. kurstaki) @ 2g/L (${Math.round(200 * 2 * acreFactor)}g in ${waterLiters}L water).`;
    chemical =
      `• RECOMMENDED TARGET SPRAY for ${acreLabel} (${waterLiters}L water / ~${tanks15L} knapsack tanks):\n` +
      `  - Chlorantraniliprole 18.5% SC (Coragen) @ ${coragenMl} ml (${(coragenMl / tanks15L).toFixed(1)} ml per 15L tank)\n` +
      `  - OR Spinetoram 11.7% SC (Delegate) @ ${delegateMl} ml (${(delegateMl / tanks15L).toFixed(1)} ml per tank)\n` +
      `• Pre-Harvest Interval (PHI): strictly 3 days.`;
    irrigation = `• Clear all wild Solanaceous weeds (nightshade) around field borders.${stageNote}${varietyNote}`;

    const speeches = {
      en: `Urgent! Tuta absoluta detected on your ${acreLabel} tomato field with ${confPct} confidence. Install ${pheromoneTraps} pheromone delta traps and spray Coragen immediately.`,
      kn: `ತುರ್ತು ಎಚ್ಚರಿಕೆ! ನಿಮ್ಮ ${acreLabel} ಟೊಮೆಟೊ ಬೆಳೆಯಲ್ಲಿ ತುತಾ ಕೀಟ ಶೇಕಡಾ ${confPct} ರಷ್ಟು ದೃಢಪಟ್ಟಿದೆ. ${pheromoneTraps} ಮೋಹಕ ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ ತಕ್ಷಣ ಕೊರಾಜೆನ್ ಸಿಂಪಡಿಸಿ.`,
      hi: `अत्यावश्यक! आपके ${acreLabel} टमाटर के खेत में ट्यूटा एब्सोलूटा कीट ${confPct} सटीकता से मिला है। ${pheromoneTraps} फेरोमोन ट्रैप लगाएं और तुरंत कोराजन छिड़कें।`,
      te: `అత్యవసరం! మీ ${acreLabel} టమోటా పొలంలో టుటా పురుగు దాడి ${confPct} ఖచ్చితత్వంతో నిర్ధారించబడింది. వెంటనే ${pheromoneTraps} లింగాకర్షక బుట్టలు పెట్టి కోరాజెన్ పిచಿಕారీ చేయండి.`,
    };
    speechSummary = speeches[lang] || speeches.en;
  }

  return {
    title,
    severity,
    immediate_action: immediate,
    organic_control: organic,
    chemical_management: chemical,
    irrigation_and_cultural: irrigation,
    speech_summary: speechSummary,
    source: 'AgroNex On-Device AI Engine',
    acreage_summary: {
      acreLabel,
      waterLiters,
      tanks15L,
      acreFactor,
    },
  };
}


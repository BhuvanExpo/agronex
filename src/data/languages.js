/**
 * Centralized multilingual dictionary for AgroNex - Tomato Leaf Doctor
 * Specifically built for detecting Tuta absoluta and Liriomyza in Tomato plants.
 * Clean, minimalist: Icon with maximum 3 words under it.
 * Supporting: English (en), Kannada (kn), Hindi (hi), Telugu (te)
 */

export const SUPPORTED_LANGUAGES = [
  {
    id: 'en',
    code: 'en-IN',
    name: 'English',
    nativeName: 'English',
    icon: 'translate',
  },
  {
    id: 'kn',
    code: 'kn-IN',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    icon: 'flower',
  },
  {
    id: 'hi',
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    icon: 'sprout',
  },
  {
    id: 'te',
    code: 'te-IN',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    icon: 'grain',
  },
];

export const UI_STRINGS = {
  en: {
    // App & Language Selection
    appTitle: 'AgroNex Tomato',
    chooseLanguage: 'Select Language',
    continue: 'Continue',

    // TalkBack
    talkbackOn: 'TalkBack ON',
    talkbackOff: 'TalkBack OFF',
    talkbackFab: 'TalkBack',
    talkbackEnabledVoice: 'TalkBack on. Tap once to hear, tap again to open.',
    talkbackDisabledVoice: 'TalkBack off.',
    tapAgainToOpen: 'Tap again to proceed.',

    // Action Dashboard (Max 3 words under icon)
    takePhoto: 'Take Photo',
    uploadPhoto: 'Upload Photo',
    take4Photos: 'Take Photo',
    upload4Photos: 'Upload Photo',
    sampleTuta: 'Tuta Absoluta',
    sampleLiriomyza: 'Liriomyza Miner',
    sampleHealthy: 'Healthy Tomato',
    sampleMixed: 'Mixed Attack',
    aiModelTrained: 'AI Model Verified',

    // Leaf Photo Slot
    slot1: 'Infected Leaf',
    addLeafPhoto: 'Add Leaf',
    tapToSnap: 'Take Leaf Photo',
    confirmPhoto: 'Confirm Photo',
    confirm4Photos: 'Confirm Photo',
    needPhotoAlert: 'Please select an infected leaf photo.',
    need4PhotosAlert: 'Please select an infected leaf photo.',

    // Screen 3 Preview (Max 3 words)
    previewTitle: 'Infected Leaf',
    retakePhoto: 'Retake Photo',
    retakeAll: 'Retake Photo',
    proceedToDetails: 'Enter Farm Data',

    // Screen 4 Farmer Details Screen (Max 3 words)
    farmerDataTitle: 'Farmer Field Data',
    landSizeTitle: 'Land Size',
    plantAgeTitle: 'Plant Age',
    plantTypeTitle: 'Tomato Variety',
    analyzeTomato: 'Diagnose Tomato',

    // Land Options (Max 3 words)
    landHalfAcre: '0.5 Acre',
    land1Acre: '1 Acre',
    land2Acres: '2 Acres',
    land5Acres: '5+ Acres',

    // Age Options (Max 3 words)
    ageSeedling: '< 20 Days',
    ageVegetative: '20-40 Days',
    ageFlowering: '40-60 Days',
    ageFruiting: '> 60 Days',

    // Variety Options (Max 3 words)
    varietyHybrid: 'Hybrid Tomato',
    varietyDesi: 'Desi (Country)',
    varietyPolyhouse: 'Polyhouse Tomato',
    varietyOpenField: 'Open Field',

    // Screen 5 Loading (Max 3 words)
    analyzingTitle: 'Detecting Pest',
    analyzingVoice: 'Analyzing infected tomato leaf for Tuta absoluta and Liriomyza, please wait.',

    // Screen 6 Advisory (Max 3 words)
    diagnosisTitle: 'Tomato Diagnosis',
    listenAdvice: '🔊 Listen Advice',
    stopAdvice: '⏹ Stop Advice',
    organicTitle: 'Organic Action',
    chemicalTitle: 'Chemical Spray',
    irrigationTitle: 'Irrigation Tips',
    diagnoseAnother: 'Diagnose Another',

    // Permissions
    cameraPermTitle: 'Camera Required',
    cameraPermMessage: 'Enable camera access in settings to capture leaf photo.',
    galleryPermTitle: 'Gallery Required',
    galleryPermMessage: 'Enable gallery access in settings to pick a leaf photo.',
    grantPermission: 'Allow',
    cancel: 'Cancel',
  },

  kn: {
    // App & Language Selection
    appTitle: 'ಟೊಮೆಟೊ ಡಾಕ್ಟರ್',
    chooseLanguage: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
    continue: 'ಮುಂದುವರಿಯಿರಿ',

    // TalkBack
    talkbackOn: 'ಟಾಕ್‌ಬ್ಯಾಕ್ ಆನ್',
    talkbackOff: 'ಟಾಕ್‌ಬ್ಯಾಕ್ ಆಫ್',
    talkbackFab: 'ಧ್ವನಿ',
    talkbackEnabledVoice: 'ಟಾಕ್‌ಬ್ಯಾಕ್ ಆನ್ ಆಗಿದೆ. ಒಮ್ಮೆ ಒತ್ತಿ ಕೇಳಿ, ಮುಂದುವರಿಯಲು ಮತ್ತೆ ಒತ್ತಿ.',
    talkbackDisabledVoice: 'ಟಾಕ್‌ಬ್ಯಾಕ್ ಆಫ್ ಆಗಿದೆ.',
    tapAgainToOpen: 'ಮುಂದುವರಿಯಲು ಮತ್ತೆ ಒತ್ತಿ.',

    // Action Dashboard (Max 3 words under icon)
    takePhoto: 'ಫೋಟೋ ತೆಗೆಯಿರಿ',
    uploadPhoto: 'ಫೋಟೋ ಆಯ್ಕೆಮಾಡಿ',
    take4Photos: 'ಫೋಟೋ ತೆಗೆಯಿರಿ',
    upload4Photos: 'ಫೋಟೋ ಆಯ್ಕೆಮಾಡಿ',
    sampleTuta: 'ತುತಾ ಅಬ್ಸೊಲ್ಯೂಟ',
    sampleLiriomyza: 'ಲಿರಿಯೊಮೈಜಾ ರೋಗ',
    sampleHealthy: 'ಆರೋಗ್ಯಕರ ಟೊಮೆಟೊ',
    sampleMixed: 'ಸಂಯುಕ್ತ ಬಾಧೆ',
    aiModelTrained: 'AI ಮಾದರಿ ತಪಾಸಣೆ',

    // Leaf Photo Slot
    slot1: 'ರೋಗಗ್ರಸ್ತ ಎಲೆ',
    addLeafPhoto: 'ಎಲೆ ಸೇರಿಸಿ',
    tapToSnap: 'ಎಲೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ',
    confirmPhoto: 'ಫೋಟೋ ಖಚಿತಪಡಿಸಿ',
    confirm4Photos: 'ಫೋಟೋ ಖಚಿತಪಡಿಸಿ',
    needPhotoAlert: 'ದಯವಿಟ್ಟು ರೋಗಗ್ರಸ್ತ ಎಲೆಯ ಫೋಟೋ ಆಯ್ಕೆಮಾಡಿ.',
    need4PhotosAlert: 'ದಯವಿಟ್ಟು ರೋಗಗ್ರಸ್ತ ಎಲೆಯ ಫೋಟೋ ಆಯ್ಕೆಮಾಡಿ.',

    // Screen 3 Preview (Max 3 words)
    previewTitle: 'ರೋಗಗ್ರಸ್ತ ಎಲೆ',
    retakePhoto: 'ಮತ್ತೆ ತೆಗೆಯಿರಿ',
    retakeAll: 'ಮತ್ತೆ ತೆಗೆಯಿರಿ',
    proceedToDetails: 'ಮಾಹಿತಿ ನೀಡಿ',

    // Screen 4 Farmer Details Screen (Max 3 words)
    farmerDataTitle: 'ರೈತರ ಜಮೀನು ಮಾಹಿತಿ',
    landSizeTitle: 'ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ',
    plantAgeTitle: 'ಗಿಡದ ವಯಸ್ಸು',
    plantTypeTitle: 'ಟೊಮೆಟೊ ತಳಿ',
    analyzeTomato: 'ರೋಗ ಪತ್ತೆಹಚ್ಚಿ',

    // Land Options (Max 3 words)
    landHalfAcre: '0.5 ಎಕರೆ',
    land1Acre: '1 ಎಕರೆ',
    land2Acres: '2 ಎಕರೆ',
    land5Acres: '5+ ಎಕರೆ',

    // Age Options (Max 3 words)
    ageSeedling: '< 20 ದಿನ',
    ageVegetative: '20-40 ದಿನ',
    ageFlowering: '40-60 ದಿನ',
    ageFruiting: '> 60 ದಿನ',

    // Variety Options (Max 3 words)
    varietyHybrid: 'ಹೈಬ್ರಿಡ್ ಟೊಮೆಟೊ',
    varietyDesi: 'ನಾಟಿ ಟೊಮೆಟೊ',
    varietyPolyhouse: 'ಪಾಲಿಹೌಸ್ ಬೆಳೆ',
    varietyOpenField: 'ಬಯಲು ಸೀಮೆ',

    // Screen 5 Loading (Max 3 words)
    analyzingTitle: 'ಪರೀಕ್ಷೆ ನಡೆಯುತ್ತಿದೆ',
    analyzingVoice: 'ಟೊಮೆಟೊ ಎಲೆಯ ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ, ದಯವಿಟ್ಟು ಕಾಯಿರಿ.',

    // Screen 6 Advisory (Max 3 words)
    diagnosisTitle: 'ಟೊಮೆಟೊ ರೋಗ ವರದಿ',
    listenAdvice: '🔊 ಸಲಹೆ ಕೇಳಿ',
    stopAdvice: '⏹ ಧ್ವನಿ ನಿಲ್ಲಿಸಿ',
    organicTitle: 'ಸಾವಯವ ಪರಿಹಾರ',
    chemicalTitle: 'ರಾಸಾಯನಿಕ ಮದ್ದು',
    irrigationTitle: 'ನೀರಾವರಿ ಸಲಹೆ',
    diagnoseAnother: 'ಇನ್ನೊಂದು ಪರೀಕ್ಷಿಸಿ',

    // Permissions
    cameraPermTitle: 'ಕ್ಯಾಮೆರಾ ಅನುಮತಿ',
    cameraPermMessage: 'ಎಲೆಯ ಫೋಟೋ ತೆಗೆಯಲು ಕ್ಯಾಮೆರಾ ಅನುಮತಿ ನೀಡಿ.',
    galleryPermTitle: 'ಗ್ಯಾಲರಿ ಅನುಮತಿ',
    galleryPermMessage: 'ಎಲೆಯ ಫೋಟೋ ಆಯ್ಕೆಮಾಡಲು ಗ್ಯಾಲರಿ ಅನುಮತಿ ನೀಡಿ.',
    grantPermission: 'ಅನುಮತಿಸಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',
  },

  hi: {
    // App & Language Selection
    appTitle: 'टमाटर डॉक्टर',
    chooseLanguage: 'भाषा चुनें',
    continue: 'आगे बढ़ें',

    // TalkBack
    talkbackOn: 'टॉकबैक चालू',
    talkbackOff: 'टॉकबैक बंद',
    talkbackFab: 'टॉकबैक',
    talkbackEnabledVoice: 'टॉकबैक चालू है। सुनने के लिए एक बार छुएं, आगे बढ़ने के लिए दोबारा दबाएं।',
    talkbackDisabledVoice: 'टॉकबैक बंद है।',
    tapAgainToOpen: 'आगे बढ़ने के लिए दोबारा दबाएं।',

    // Action Dashboard (Max 3 words under icon)
    takePhoto: 'फोटो खींचें',
    uploadPhoto: 'फोटो चुनें',
    take4Photos: 'फोटो खींचें',
    upload4Photos: 'फोटो चुनें',
    sampleTuta: 'ट्यूटा एब्सोल्युटा',
    sampleLiriomyza: 'लिरियोमाइज़ा कीट',
    sampleHealthy: 'स्वस्थ टमाटर',
    sampleMixed: 'संयुक्त प्रकोप',
    aiModelTrained: 'AI मॉडल परीक्षण',

    // Leaf Photo Slot
    slot1: 'संक्रमित पत्ती',
    addLeafPhoto: 'पत्ती जोड़ें',
    tapToSnap: 'पत्ती फोटो लें',
    confirmPhoto: 'फोटो पुष्टि करें',
    confirm4Photos: 'फोटो पुष्टि करें',
    needPhotoAlert: 'कृपया संक्रमित पत्ती की फोटो चुनें।',
    need4PhotosAlert: 'कृपया संक्रमित पत्ती की फोटो चुनें।',

    // Screen 3 Preview (Max 3 words)
    previewTitle: 'संक्रमित पत्ती',
    retakePhoto: 'दोबारा फोटो लें',
    retakeAll: 'दोबारा फोटो लें',
    proceedToDetails: 'खेत विवरण दें',

    // Screen 4 Farmer Details Screen (Max 3 words)
    farmerDataTitle: 'किसान खेत विवरण',
    landSizeTitle: 'खेत का रकबा',
    plantAgeTitle: 'पौधे की उम्र',
    plantTypeTitle: 'टमाटर की किस्म',
    analyzeTomato: 'रोग पहचानें',

    // Land Options (Max 3 words)
    landHalfAcre: '0.5 एकड़',
    land1Acre: '1 एकड़',
    land2Acres: '2 एकड़',
    land5Acres: '5+ एकड़',

    // Age Options (Max 3 words)
    ageSeedling: '< 20 दिन',
    ageVegetative: '20-40 दिन',
    ageFlowering: '40-60 दिन',
    ageFruiting: '> 60 दिन',

    // Variety Options (Max 3 words)
    varietyHybrid: 'हाइब्रिड टमाटर',
    varietyDesi: 'देसी टमाटर',
    varietyPolyhouse: 'पॉलीहाउस टमाटर',
    varietyOpenField: 'खुला खेत',

    // Screen 5 Loading (Max 3 words)
    analyzingTitle: 'जांच जारी है',
    analyzingVoice: 'टमाटर की पत्ती की जांच हो रही है, कृपया प्रतीक्षा करें।',

    // Screen 6 Advisory (Max 3 words)
    diagnosisTitle: 'टमाटर रोग रिपोर्ट',
    listenAdvice: '🔊 सलाह सुनें',
    stopAdvice: '⏹ आवाज़ रोकें',
    organicTitle: 'जैविक उपचार',
    chemicalTitle: 'रासायनिक दवा',
    irrigationTitle: 'सिंचाई सुझाव',
    diagnoseAnother: 'दूसरी जांच करें',

    // Permissions
    cameraPermTitle: 'कैमरा अनुमति',
    cameraPermMessage: 'पत्ती की फोटो लेने के लिए कैमरा अनुमति दें।',
    galleryPermTitle: 'गैलरी अनुमति',
    galleryPermMessage: 'पत्ती की फोटो चुनने के लिए गैलरी अनुमति दें।',
    grantPermission: 'अनुमति दें',
    cancel: 'रद्द करें',
  },

  te: {
    // App & Language Selection
    appTitle: 'టమోటా డాక్టర్',
    chooseLanguage: 'భాషను ఎంచుకోండి',
    continue: 'ముందుకు సాగండి',

    // TalkBack
    talkbackOn: 'టాక్‌బ్యాక్ ఆన్',
    talkbackOff: 'టాక్‌బ్యాక్ ఆఫ్',
    talkbackFab: 'వాయిస్',
    talkbackEnabledVoice: 'టాక్‌బ్యాక్ ఆన్ అయింది. వినడానికి ఒకసారి, ముందుకు సాగడానికి మళ్లీ నొక్కండి.',
    talkbackDisabledVoice: 'టాక్‌బ్యాక్ ఆఫ్ అయింది.',
    tapAgainToOpen: 'ముందుకు సాగడానికి మళ్లీ నొక్కండి.',

    // Action Dashboard (Max 3 words under icon)
    takePhoto: 'ఫోటో తీయండి',
    uploadPhoto: 'ఫోటో ఎంచుకోండి',
    take4Photos: 'ఫోటో తీయండి',
    upload4Photos: 'ఫోటో ఎంచుకోండి',
    sampleTuta: 'టుటా అబ్సొల్యూటా',
    sampleLiriomyza: 'లిరియోమైజా తెగులు',
    sampleHealthy: 'ఆరోగ్యకర టమోటా',
    sampleMixed: 'మిశ్రమ తెగులు',
    aiModelTrained: 'AI మోడల్ విశ్లేషణ',

    // Leaf Photo Slot
    slot1: 'సోకిన ఆకు',
    addLeafPhoto: 'ఆకు చేర్చండి',
    tapToSnap: 'ఆకు ఫోటో తీయండి',
    confirmPhoto: 'ఫోటో ఖరారు',
    confirm4Photos: 'ఫోటో ఖరారు',
    needPhotoAlert: 'దయచేసి తెగులు సోకిన ఆకు ఫోటో ఎంచుకోండి.',
    need4PhotosAlert: 'దయచేసి తెగులు సోకిన ఆకు ఫోటో ఎంచుకోండి.',

    // Screen 3 Preview (Max 3 words)
    previewTitle: 'సోకిన ఆకు',
    retakePhoto: 'మళ్లీ తీయండి',
    retakeAll: 'మళ్లీ తీయండి',
    proceedToDetails: 'పొలం వివరాలు',

    // Screen 4 Farmer Details Screen (Max 3 words)
    farmerDataTitle: 'రైతు పొలం వివరాలు',
    landSizeTitle: 'పొలం విస్తీర్ణం',
    plantAgeTitle: 'మొక్క వయస్సు',
    plantTypeTitle: 'టమోటా రకం',
    analyzeTomato: 'తెగులు గుర్తించండి',

    // Land Options (Max 3 words)
    landHalfAcre: '0.5 ఎకరం',
    land1Acre: '1 ఎకరం',
    land2Acres: '2 ఎకరాలు',
    land5Acres: '5+ ఎకరాలు',

    // Age Options (Max 3 words)
    ageSeedling: '< 20 రోజులు',
    ageVegetative: '20-40 రోజులు',
    ageFlowering: '40-60 రోజులు',
    ageFruiting: '> 60 రోజులు',

    // Variety Options (Max 3 words)
    varietyHybrid: 'హైబ్రిడ్ టమోటా',
    varietyDesi: 'నాటు టమోటా',
    varietyPolyhouse: 'పాలీహౌస్ టమోటా',
    varietyOpenField: 'బహిరంగ పొలం',

    // Screen 5 Loading (Max 3 words)
    analyzingTitle: 'పరిశీలిస్తున్నాము',
    analyzingVoice: 'టమోటా ఆకును పరిశీలిస్తున్నాము, దయచేసి వేచి ఉండండి.',

    // Screen 6 Advisory (Max 3 words)
    diagnosisTitle: 'టమోటా తెగులు నివేదిక',
    listenAdvice: '🔊 సలహా వినండి',
    stopAdvice: '⏹ ఆడియో ఆపండి',
    organicTitle: 'సేంద్రీయ చర్య',
    chemicalTitle: 'రసాయన మందు',
    irrigationTitle: 'నీటి యాజమాన్యం',
    diagnoseAnother: 'మరొకటి పరిశీలించండి',

    // Permissions
    cameraPermTitle: 'కెమెరా అనుమతి',
    cameraPermMessage: 'ఆకు ఫోటో తీయడానికి కెమెరా అనుమతి ఇవ్వండి.',
    galleryPermTitle: 'గ్యాలరీ అనుమతి',
    galleryPermMessage: 'ఆకు ఫోటో ఎంచుకోవడానికి గ్యాలరీ అనుమతి ఇవ్వండి.',
    grantPermission: 'అనుమతించు',
    cancel: 'రద్దు చేయండి',
  },
};

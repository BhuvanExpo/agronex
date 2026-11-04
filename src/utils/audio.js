import * as Speech from 'expo-speech';

/**
 * Maps app language keys to regional Android TTS locale codes
 */
export const LANGUAGE_SPEECH_MAP = {
  en: 'en-IN',
  kn: 'kn-IN',
  hi: 'hi-IN',
  te: 'te-IN',
};

export const LANGUAGE_FALLBACK_MAP = {
  en: 'en-US',
  kn: 'kn',
  hi: 'hi',
  te: 'te',
};

/**
 * Speaks text using Android Text-to-Speech with farmer-friendly slow cadence
 */
export const speakFarmerAdvice = async (text, langKey = 'en', onDone = null, onError = null) => {
  try {
    await stopSpeech();

    if (!text || typeof text !== 'string') return;

    const primaryLocale = LANGUAGE_SPEECH_MAP[langKey] || 'en-IN';

    const options = {
      language: primaryLocale,
      pitch: 1.0,
      rate: 0.85,
      onDone: () => {
        if (onDone) onDone();
      },
      onStopped: () => {
        if (onDone) onDone();
      },
      onError: (err) => {
        const fallbackLocale = LANGUAGE_FALLBACK_MAP[langKey];
        if (fallbackLocale && fallbackLocale !== primaryLocale) {
          Speech.speak(text, {
            language: fallbackLocale,
            pitch: 1.0,
            rate: 0.85,
            onDone: () => {
              if (onDone) onDone();
            },
            onError: (fallbackErr) => {
              console.warn('Speech playback fallback failed:', fallbackErr);
              if (onError) onError(fallbackErr);
            },
          });
        } else {
          if (onError) onError(err);
        }
      },
    };

    Speech.speak(text, options);
  } catch (err) {
    console.warn('Error starting speech:', err);
    if (onError) onError(err);
  }
};

/**
 * TalkBack helper: Speaks aloud only if talkback mode is ON
 */
export const speakTalkBack = (text, langKey = 'en', isTalkbackOn = false) => {
  if (!isTalkbackOn) return;
  speakFarmerAdvice(text, langKey);
};

/**
 * Stops any active speech synthesis immediately
 */
export const stopSpeech = async () => {
  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }
  } catch (err) {
    // Silently ignore
  }
};

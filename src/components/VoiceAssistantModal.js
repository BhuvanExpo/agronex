import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, dimensions } from '../utils/theme';
import { UI_STRINGS } from '../data/languages';
import { speakFarmerAdvice, stopSpeech } from '../utils/audio';

export default function VoiceAssistantModal({
  visible,
  onClose,
  currentLanguage = 'en',
  onTakePhoto,
  onPickGallery,
  onSelectSample,
}) {
  const strings = UI_STRINGS[currentLanguage] || UI_STRINGS.en;
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');

  // Animated pulse values for ripple effect
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0.4)).current;
  const waveAnim2 = useRef(new Animated.Value(0.7)).current;
  const waveAnim3 = useRef(new Animated.Value(0.5)).current;
  const waveAnim4 = useRef(new Animated.Value(0.9)).current;
  const waveAnim5 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (visible) {
      setIsListening(true);
      setSpokenTranscript(strings.voiceListening);

      // Start pulsing ripples
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start waveform animation
      const animateWave = (anim, duration) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 0.2,
              duration,
              useNativeDriver: false,
            }),
          ])
        ).start();
      };

      animateWave(waveAnim1, 350);
      animateWave(waveAnim2, 450);
      animateWave(waveAnim3, 300);
      animateWave(waveAnim4, 500);
      animateWave(waveAnim5, 400);

      // Speak greeting
      const promptText = strings.voiceInstruction;
      speakFarmerAdvice(promptText, currentLanguage);
    } else {
      stopSpeech();
      setIsListening(false);
    }

    return () => {
      stopSpeech();
    };
  }, [visible, currentLanguage]);

  const handleCommand = (type, sampleId = null) => {
    setIsListening(false);
    stopSpeech();

    if (type === 'camera') {
      setSpokenTranscript(`"📸 ${strings.takePhotoTitle}"`);
      setTimeout(() => {
        onClose();
        if (onTakePhoto) onTakePhoto();
      }, 500);
    } else if (type === 'gallery') {
      setSpokenTranscript(`"🖼️ ${strings.galleryTitle}"`);
      setTimeout(() => {
        onClose();
        if (onPickGallery) onPickGallery();
      }, 500);
    } else if (type === 'sample' && sampleId) {
      setSpokenTranscript(`"🌾 ${sampleId}"`);
      setTimeout(() => {
        onClose();
        if (onSelectSample) onSelectSample(sampleId);
      }, 500);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogCard}>
          {/* Header */}
          <View style={styles.dialogHeader}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons name="microphone-message" size={26} color="#059669" />
              <Text style={styles.headerTitle}>{strings.voiceAssistantTitle}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel="Close voice assistant"
            >
              <MaterialCommunityIcons name="close" size={24} color={colors.slate700} />
            </TouchableOpacity>
          </View>

          {/* Central Pulsing Mic Area */}
          <View style={styles.micContainer}>
            {/* Outer animated ripple */}
            <Animated.View
              style={[
                styles.rippleRing,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.25],
                    outputRange: [0.6, 0.1],
                  }),
                },
              ]}
            />
            {/* Inner pulsating circle */}
            <Animated.View
              style={[
                styles.innerRing,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />

            <TouchableOpacity
              style={styles.micCircle}
              activeOpacity={0.8}
              onPress={() => {
                if (isListening) {
                  stopSpeech();
                  setIsListening(false);
                } else {
                  setIsListening(true);
                  speakFarmerAdvice(strings.voiceListening, currentLanguage);
                }
              }}
            >
              <MaterialCommunityIcons
                name={isListening ? 'microphone' : 'microphone-off'}
                size={40}
                color={colors.white}
              />
            </TouchableOpacity>
          </View>

          {/* Audio Waveform Visualization */}
          <View style={styles.waveformContainer}>
            <Animated.View style={[styles.waveBar, { height: waveAnim1.interpolate({ inputRange: [0, 1], outputRange: [8, 36] }) }]} />
            <Animated.View style={[styles.waveBar, { height: waveAnim2.interpolate({ inputRange: [0, 1], outputRange: [12, 44] }) }]} />
            <Animated.View style={[styles.waveBar, { height: waveAnim3.interpolate({ inputRange: [0, 1], outputRange: [10, 32] }) }]} />
            <Animated.View style={[styles.waveBar, { height: waveAnim4.interpolate({ inputRange: [0, 1], outputRange: [14, 48] }) }]} />
            <Animated.View style={[styles.waveBar, { height: waveAnim5.interpolate({ inputRange: [0, 1], outputRange: [8, 28] }) }]} />
          </View>

          {/* Spoken feedback banner */}
          <View style={styles.transcriptBox}>
            <Text style={styles.listeningStatusText}>
              {spokenTranscript || strings.voiceListening}
            </Text>
          </View>

          {/* Quick Spoken Voice Actions for Farmers */}
          <Text style={styles.commandsHeader}>
            {strings.voiceInstruction}
          </Text>

          <View style={styles.commandList}>
            <TouchableOpacity
              style={styles.commandTile}
              onPress={() => handleCommand('camera')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="camera" size={24} color="#047857" />
              <Text style={styles.commandTileText}>{strings.voiceCmdPhoto}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.commandTile}
              onPress={() => handleCommand('gallery')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="image-multiple" size={24} color="#0284C7" />
              <Text style={styles.commandTileText}>{strings.voiceCmdGallery}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.commandTile}
              onPress={() => handleCommand('sample', 'paddy_blight')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="grass" size={24} color="#D97706" />
              <Text style={styles.commandTileText}>{strings.voiceCmdPaddy}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.commandTile}
              onPress={() => handleCommand('sample', 'tomato_mildew')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="food-apple" size={24} color="#DC2626" />
              <Text style={styles.commandTileText}>{strings.voiceCmdTomato}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primaryDark,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.slate200,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.titleMedium,
    fontWeight: typography.weightBold,
    color: colors.slate950,
    marginLeft: 8,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.slate100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    height: 120,
  },
  rippleRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#34D399',
  },
  innerRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#A7F3D0',
  },
  micCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    elevation: 6,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    gap: 8,
    marginBottom: 10,
  },
  waveBar: {
    width: 6,
    backgroundColor: '#059669',
    borderRadius: 4,
  },
  transcriptBox: {
    backgroundColor: colors.primaryUltraLight,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  listeningStatusText: {
    fontSize: typography.bodyLarge,
    fontWeight: typography.weightBold,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  commandsHeader: {
    fontSize: typography.bodyMedium,
    fontWeight: typography.weightSemiBold,
    color: colors.slate700,
    marginBottom: 10,
  },
  commandList: {
    gap: 10,
  },
  commandTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slate50,
    borderWidth: 1.5,
    borderColor: colors.slate300,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: dimensions.minTouchTarget,
  },
  commandTileText: {
    fontSize: typography.bodyMedium,
    fontWeight: typography.weightSemiBold,
    color: colors.slate900,
    marginLeft: 12,
    flex: 1,
  },
});

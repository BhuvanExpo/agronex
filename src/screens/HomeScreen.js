import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography } from '../utils/theme';
import { UI_STRINGS, SUPPORTED_LANGUAGES } from '../data/languages';
import { MOCK_DISEASES } from '../data/diseases';
import Header from '../components/Header';
import { speakFarmerAdvice, stopSpeech } from '../utils/audio';

export default function HomeScreen({
  currentLanguage,
  onChangeLanguage,
  onImagesSelected,
  talkbackEnabled,
  onToggleTalkback,
}) {
  const strings = UI_STRINGS[currentLanguage] || UI_STRINGS.en;
  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.id === currentLanguage);

  // Accessibility TalkBack: stores currently focused item ID
  const [focusedItemId, setFocusedItemId] = useState(null);

  // Floating button pulsing animation when TalkBack is active
  const fabPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let anim;
    if (talkbackEnabled) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(fabPulse, {
            toValue: 1.15,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(fabPulse, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
    } else {
      fabPulse.setValue(1);
    }

    return () => {
      if (anim) anim.stop();
      stopSpeech();
    };
  }, [talkbackEnabled]);

  /**
   * TalkBack 2-click pattern:
   * When TalkBack is OFF: 1st tap executes action immediately.
   * When TalkBack is ON: 1st tap speaks description, 2nd tap on same item executes!
   */
  const handleItemPress = (itemId, spokenText, actionFn) => {
    if (!talkbackEnabled) {
      actionFn();
      return;
    }

    if (focusedItemId === itemId) {
      // 2nd tap on same item -> execute action!
      setFocusedItemId(null);
      stopSpeech();
      actionFn();
    } else {
      // 1st tap -> highlight and speak aloud
      setFocusedItemId(itemId);
      const textToSpeak = `${spokenText}. ${strings.tapAgainToOpen}`;
      speakFarmerAdvice(textToSpeak, currentLanguage);
    }
  };

  const handleToggleTalkbackFab = () => {
    const nextState = !talkbackEnabled;
    onToggleTalkback();
    setFocusedItemId(null);
    const announce = nextState ? strings.talkbackEnabledVoice : strings.talkbackDisabledVoice;
    speakFarmerAdvice(announce, currentLanguage);
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(strings.cameraPermTitle, strings.cameraPermMessage);
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imageSource = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        onImagesSelected([imageSource]);
      }
    } catch (err) {
      console.warn('Camera error:', err);
    }
  };

  const handlePickGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(strings.galleryPermTitle, strings.galleryPermMessage);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imageSource = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        onImagesSelected([imageSource]);
      }
    } catch (err) {
      console.warn('Gallery error:', err);
    }
  };

  const handleSampleSelected = (diseaseId) => {
    const disease = MOCK_DISEASES.find((d) => d.id === diseaseId) || MOCK_DISEASES[0];
    onImagesSelected([disease.sampleImages[0]], disease.id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={strings.appTitle}
        activeLanguage={activeLangObj}
        onChangeLanguage={onChangeLanguage}
        showLanguageBadge={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Two Central Touch Cards (Icon with Max 3 words under it) */}
        <View style={styles.actionGrid}>
          {/* Card 1: Take Photo */}
          <TouchableOpacity
            style={[
              styles.actionCard,
              focusedItemId === 'camera' && styles.actionCardFocused,
            ]}
            onPress={() =>
              handleItemPress('camera', strings.takePhoto, handleTakePhoto)
            }
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <View style={[styles.iconCircle, { backgroundColor: '#064E3B' }]}>
              <MaterialCommunityIcons name="camera" size={48} color={colors.white} />
            </View>
            <Text style={styles.cardTitle}>{strings.takePhoto}</Text>
          </TouchableOpacity>

          {/* Card 2: Upload Photo */}
          <TouchableOpacity
            style={[
              styles.actionCard,
              styles.galleryCard,
              focusedItemId === 'gallery' && styles.actionCardFocused,
            ]}
            onPress={() =>
              handleItemPress('gallery', strings.uploadPhoto, handlePickGallery)
            }
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <View style={[styles.iconCircle, { backgroundColor: '#0369A1' }]}>
              <MaterialCommunityIcons name="image-plus" size={48} color={colors.white} />
            </View>
            <Text style={styles.cardTitle}>{strings.uploadPhoto}</Text>
          </TouchableOpacity>
        </View>

        {/* Tomato Disease Focus: 4 Classes (Max 3 words under icon) */}
        <View style={styles.sampleContainer}>
          <TouchableOpacity
            style={[
              styles.sampleTile,
              focusedItemId === 'tuta' && styles.sampleTileFocused,
            ]}
            onPress={() =>
              handleItemPress('tuta', strings.sampleTuta, () =>
                handleSampleSelected('tuta_absoluta')
              )
            }
            activeOpacity={0.8}
          >
            <View style={[styles.sampleIconCircle, { backgroundColor: '#FEF2F2' }]}>
              <MaterialCommunityIcons name="bug" size={32} color="#DC2626" />
            </View>
            <Text style={styles.sampleLabel}>{strings.sampleTuta}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sampleTile,
              focusedItemId === 'liriomyza' && styles.sampleTileFocused,
            ]}
            onPress={() =>
              handleItemPress('liriomyza', strings.sampleLiriomyza, () =>
                handleSampleSelected('liriomyza_miner')
              )
            }
            activeOpacity={0.8}
          >
            <View style={[styles.sampleIconCircle, { backgroundColor: '#FFFBEB' }]}>
              <MaterialCommunityIcons name="butterfly" size={32} color="#D97706" />
            </View>
            <Text style={styles.sampleLabel}>{strings.sampleLiriomyza}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sampleTile,
              focusedItemId === 'healthy' && styles.sampleTileFocused,
            ]}
            onPress={() =>
              handleItemPress('healthy', strings.sampleHealthy, () =>
                handleSampleSelected('healthy')
              )
            }
            activeOpacity={0.8}
          >
            <View style={[styles.sampleIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <MaterialCommunityIcons name="shield-check" size={32} color="#059669" />
            </View>
            <Text style={styles.sampleLabel}>{strings.sampleHealthy}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sampleTile,
              focusedItemId === 'mixed' && styles.sampleTileFocused,
            ]}
            onPress={() =>
              handleItemPress('mixed', strings.sampleMixed, () =>
                handleSampleSelected('both_mixed')
              )
            }
            activeOpacity={0.8}
          >
            <View style={[styles.sampleIconCircle, { backgroundColor: '#F5F3FF' }]}>
              <MaterialCommunityIcons name="biohazard" size={32} color="#7C3AED" />
            </View>
            <Text style={styles.sampleLabel}>{strings.sampleMixed}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Round Floating Action Button (FAB) in Bottom Right for TalkBack Toggle */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        {talkbackEnabled && (
          <Animated.View
            style={[
              styles.fabPulseRing,
              {
                transform: [{ scale: fabPulse }],
                opacity: fabPulse.interpolate({
                  inputRange: [1, 1.15],
                  outputRange: [0.6, 0],
                }),
              },
            ]}
          />
        )}
        <TouchableOpacity
          style={[
            styles.fabButton,
            talkbackEnabled ? styles.fabButtonOn : styles.fabButtonOff,
          ]}
          onPress={handleToggleTalkbackFab}
          activeOpacity={0.8}
          accessibilityRole="switch"
          accessibilityLabel={talkbackEnabled ? strings.talkbackOn : strings.talkbackOff}
        >
          <MaterialCommunityIcons
            name={talkbackEnabled ? 'volume-high' : 'volume-off'}
            size={30}
            color={talkbackEnabled ? '#022C22' : colors.white}
          />
          <Text
            style={[
              styles.fabText,
              talkbackEnabled ? styles.fabTextOn : styles.fabTextOff,
            ]}
          >
            {talkbackEnabled ? 'TALK ON' : 'TALK OFF'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.slate50,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  actionGrid: {
    gap: 16,
    marginBottom: 20,
    marginTop: 8,
  },
  actionCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.primaryDark,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  actionCardFocused: {
    borderColor: '#F59E0B',
    borderWidth: 4,
    backgroundColor: '#FEF3C7',
    elevation: 8,
  },
  galleryCard: {
    borderColor: colors.accentBlueBorder,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: typography.weightBold,
    color: colors.slate950,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  sampleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  sampleTile: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.slate300,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
    elevation: 2,
  },
  sampleTileFocused: {
    borderColor: '#F59E0B',
    borderWidth: 3.5,
    backgroundColor: '#FEF3C7',
    elevation: 6,
  },
  sampleIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: colors.slate200,
  },
  sampleLabel: {
    fontSize: 15,
    fontWeight: typography.weightBold,
    color: colors.slate900,
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabPulseRing: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#34D399',
  },
  fabButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 2.5,
  },
  fabButtonOn: {
    backgroundColor: '#34D399',
    borderColor: colors.white,
  },
  fabButtonOff: {
    backgroundColor: colors.slate800,
    borderColor: colors.slate400,
  },
  fabText: {
    fontSize: 10,
    fontWeight: typography.weightBold,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  fabTextOn: {
    color: '#022C22',
  },
  fabTextOff: {
    color: colors.white,
  },
});

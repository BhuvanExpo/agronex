import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, dimensions } from '../utils/theme';
import { UI_STRINGS, SUPPORTED_LANGUAGES } from '../data/languages';
import Header from '../components/Header';
import { stopSpeech, speakFarmerAdvice } from '../utils/audio';

export default function PreviewScreen({
  images = [],
  currentLanguage,
  onRetake,
  onProceedToDetails,
  onChangeLanguage,
  talkbackEnabled,
  onToggleTalkback,
  isOfflineMode = false,
}) {
  const strings = UI_STRINGS[currentLanguage] || UI_STRINGS.en;
  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.id === currentLanguage);

  const selectedImageUri = images && images.length > 0 ? images[0] : null;
  const [focusedBtn, setFocusedBtn] = useState(null);

  const handleAccessibleAction = (btnId, spokenText, actionFn) => {
    if (!talkbackEnabled) {
      stopSpeech();
      actionFn();
      return;
    }

    if (focusedBtn === btnId) {
      setFocusedBtn(null);
      stopSpeech();
      actionFn();
    } else {
      setFocusedBtn(btnId);
      const prompt = `${spokenText}. ${strings.tapAgainToOpen}`;
      speakFarmerAdvice(prompt, currentLanguage);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, isOfflineMode && { backgroundColor: '#FEF2F2' }]}>
      <Header
        title={isOfflineMode ? `${strings.previewTitle} (OFFLINE)` : strings.previewTitle}
        onBack={() => handleAccessibleAction('back', strings.retakePhoto, onRetake)}
        activeLanguage={activeLangObj}
        onChangeLanguage={onChangeLanguage}
        showLanguageBadge={true}
        talkbackEnabled={talkbackEnabled}
        onToggleTalkback={onToggleTalkback}
        isOffline={isOfflineMode}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Single Infected Leaf Preview Card */}
        <View style={styles.heroCard}>
          {selectedImageUri ? (
            <Image source={{ uri: selectedImageUri }} style={styles.cardImage} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderBox}>
              <MaterialCommunityIcons name="image-off" size={48} color={colors.slate400} />
            </View>
          )}

          {/* Clean Label - Max 2-3 words */}
          <View style={styles.labelRow}>
            <View style={styles.badgeLeft}>
              <MaterialCommunityIcons name="leaf" size={22} color="#059669" />
              <Text style={styles.labelText}>{strings.slot1}</Text>
            </View>
            <View style={styles.badgeRight}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#059669" />
              <Text style={styles.readyText}>Ready</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Row (Max 2-3 words per button) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.retakeButton, focusedBtn === 'retake' && styles.btnFocused]}
          onPress={() => handleAccessibleAction('retake', strings.retakePhoto, onRetake)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="camera-retake" size={24} color={colors.slate800} />
          <Text style={styles.retakeText}>{strings.retakePhoto}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.proceedButton, focusedBtn === 'proceed' && styles.btnFocused]}
          onPress={() => handleAccessibleAction('proceed', strings.proceedToDetails, onProceedToDetails)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="clipboard-edit" size={24} color={colors.white} />
          <Text style={styles.proceedText}>{strings.proceedToDetails}</Text>
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
    paddingBottom: 150,
  },
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.primaryDark,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cardImage: {
    width: '100%',
    height: 380,
    backgroundColor: colors.slate900,
  },
  placeholderBox: {
    width: '100%',
    height: 380,
    backgroundColor: colors.slate100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderTopWidth: 2,
    borderTopColor: colors.slate200,
  },
  badgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 18,
    fontWeight: typography.weightBold,
    color: colors.slate950,
    marginLeft: 8,
  },
  readyText: {
    fontSize: 15,
    fontWeight: typography.weightBold,
    color: '#059669',
    marginLeft: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 2,
    borderTopColor: colors.slate300,
    elevation: 8,
    gap: 10,
  },
  photoCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: colors.primaryDark,
    overflow: 'hidden',
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.slate900,
  },
  placeholderBox: {
    width: '100%',
    height: 180,
    backgroundColor: colors.slate100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
    borderTopWidth: 1.5,
    borderTopColor: colors.slate200,
  },
  labelText: {
    fontSize: 14,
    fontWeight: typography.weightBold,
    color: colors.slate950,
    marginLeft: 6,
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 2,
    borderTopColor: colors.slate300,
    elevation: 8,
    gap: 10,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.slate100,
    borderWidth: 2,
    borderColor: colors.slate400,
    borderRadius: 12,
    minHeight: dimensions.minTouchTarget,
    paddingHorizontal: 16,
  },
  retakeText: {
    fontSize: 17,
    fontWeight: typography.weightBold,
    color: colors.slate800,
    marginLeft: 8,
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    minHeight: dimensions.buttonHeight,
    paddingHorizontal: 16,
    elevation: 4,
  },
  btnFocused: {
    borderColor: '#F59E0B',
    borderWidth: 3.5,
  },
  proceedText: {
    fontSize: 19,
    fontWeight: typography.weightBold,
    color: colors.white,
    marginLeft: 8,
  },
});

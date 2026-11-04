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
}) {
  const strings = UI_STRINGS[currentLanguage] || UI_STRINGS.en;
  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.id === currentLanguage);

  const slotLabels = [strings.slot1, strings.slot2, strings.slot3, strings.slot4];
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
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={strings.previewTitle}
        onBack={() => handleAccessibleAction('back', strings.retakeAll, onRetake)}
        activeLanguage={activeLangObj}
        onChangeLanguage={onChangeLanguage}
        showLanguageBadge={true}
        talkbackEnabled={talkbackEnabled}
        onToggleTalkback={onToggleTalkback}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 4 Infected Leaf Photos Grid (2x2) */}
        <View style={styles.gridContainer}>
          {slotLabels.map((label, index) => {
            const uri = images[index];

            return (
              <View key={index} style={styles.photoCard}>
                {uri ? (
                  <Image source={{ uri }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                  <View style={styles.placeholderBox}>
                    <MaterialCommunityIcons name="image-off" size={32} color={colors.slate400} />
                  </View>
                )}
                {/* Clean Label - Max 2 words: e.g. Leaf 1 */}
                <View style={styles.labelRow}>
                  <MaterialCommunityIcons name="leaf" size={18} color="#059669" />
                  <Text style={styles.labelText} numberOfLines={1}>
                    {label}
                  </Text>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#059669" />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Action Row (Max 2-3 words per button) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.retakeButton, focusedBtn === 'retake' && styles.btnFocused]}
          onPress={() => handleAccessibleAction('retake', strings.retakeAll, onRetake)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="camera-retake" size={24} color={colors.slate800} />
          <Text style={styles.retakeText}>{strings.retakeAll}</Text>
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
    padding: 14,
    paddingBottom: 110,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
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

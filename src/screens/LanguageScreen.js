import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, dimensions } from '../utils/theme';
import { SUPPORTED_LANGUAGES, UI_STRINGS } from '../data/languages';
import Header from '../components/Header';
import { speakFarmerAdvice, stopSpeech } from '../utils/audio';

export default function LanguageScreen({
  selectedLanguage,
  onSelectLanguage,
  onContinue,
  talkbackEnabled,
  onToggleTalkback,
}) {
  const [activeLangId, setActiveLangId] = useState(selectedLanguage || 'en');
  const [focusedLangId, setFocusedLangId] = useState(null);
  const strings = UI_STRINGS[activeLangId] || UI_STRINGS.en;

  const handleSelect = (lang) => {
    if (!talkbackEnabled) {
      setActiveLangId(lang.id);
      onSelectLanguage(lang.id);
      return;
    }

    if (focusedLangId === lang.id) {
      setFocusedLangId(null);
      setActiveLangId(lang.id);
      onSelectLanguage(lang.id);
    } else {
      setFocusedLangId(lang.id);
      speakFarmerAdvice(`${lang.nativeName}. ${strings.tapAgainToOpen}`, lang.id);
    }
  };

  const handleContinuePress = () => {
    if (!talkbackEnabled) {
      stopSpeech();
      onContinue();
      return;
    }

    if (focusedLangId === 'continue') {
      setFocusedLangId(null);
      stopSpeech();
      onContinue();
    } else {
      setFocusedLangId('continue');
      speakFarmerAdvice(`${strings.continue}. ${strings.tapAgainToOpen}`, activeLangId);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={colors.primaryDark} barStyle="light-content" />

      <Header
        title={strings.appTitle}
        showLanguageBadge={false}
        talkbackEnabled={talkbackEnabled}
        onToggleTalkback={onToggleTalkback}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title: Max 2-3 words */}
        <Text style={styles.sectionHeader}>{strings.chooseLanguage}</Text>

        {/* 4 Clean Language Cards (Icon + Name) */}
        <View style={styles.languageList}>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = activeLangId === lang.id;
            const isFocused = focusedLangId === lang.id;

            return (
              <TouchableOpacity
                key={lang.id}
                style={[
                  styles.languageCard,
                  isSelected && styles.languageCardSelected,
                  isFocused && styles.languageCardFocused,
                ]}
                onPress={() => handleSelect(lang)}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <View style={styles.cardLeft}>
                  <View
                    style={[
                      styles.iconCircle,
                      isSelected && styles.iconCircleSelected,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={lang.icon}
                      size={28}
                      color={isSelected ? colors.white : colors.primaryDark}
                    />
                  </View>
                  <Text
                    style={[
                      styles.nativeNameText,
                      isSelected && styles.nativeNameTextSelected,
                    ]}
                  >
                    {lang.nativeName}
                  </Text>
                </View>

                {isSelected ? (
                  <View style={styles.checkBadge}>
                    <MaterialCommunityIcons name="check-bold" size={20} color={colors.white} />
                  </View>
                ) : (
                  <MaterialCommunityIcons name="chevron-right" size={24} color={colors.slate400} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Fixed Bottom Continue Button (1 word: Continue) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            focusedLangId === 'continue' && styles.continueButtonFocused,
          ]}
          onPress={handleContinuePress}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>{strings.continue}</Text>
          <MaterialCommunityIcons
            name="arrow-right-thick"
            size={24}
            color={colors.white}
            style={styles.continueIcon}
          />
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
    padding: 18,
    paddingBottom: 100,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: typography.weightBold,
    color: colors.slate950,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  languageList: {
    gap: 14,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: colors.slate300,
    paddingVertical: 18,
    paddingHorizontal: 18,
    minHeight: 76,
    elevation: 3,
  },
  languageCardSelected: {
    backgroundColor: colors.primaryUltraLight,
    borderColor: colors.primaryDark,
    borderWidth: 3,
  },
  languageCardFocused: {
    borderColor: '#F59E0B',
    borderWidth: 3.5,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryUltraLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
  },
  iconCircleSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDarkest,
  },
  nativeNameText: {
    fontSize: 22,
    fontWeight: typography.weightBold,
    color: colors.slate950,
  },
  nativeNameTextSelected: {
    color: colors.primaryDark,
  },
  checkBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderTopColor: colors.slate200,
    elevation: 8,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
    borderRadius: 14,
    minHeight: dimensions.buttonHeight,
    paddingHorizontal: 20,
  },
  continueButtonFocused: {
    borderColor: '#F59E0B',
    borderWidth: 3.5,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: typography.weightBold,
  },
  continueIcon: {
    marginLeft: 8,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, dimensions } from '../utils/theme';
import { UI_STRINGS, SUPPORTED_LANGUAGES } from '../data/languages';
import { getLocalizedDisease } from '../data/diseases';
import Header from '../components/Header';
import SeverityBadge from '../components/SeverityBadge';
import { speakFarmerAdvice, stopSpeech } from '../utils/audio';

export default function AdvisoryScreen({
  images = [],
  diseaseId = 'tuta_absoluta',
  farmerData = null,
  currentLanguage = 'en',
  onBackToHome,
  onChangeLanguage,
  talkbackEnabled,
  onToggleTalkback,
}) {
  const strings = UI_STRINGS[currentLanguage] || UI_STRINGS.en;
  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.id === currentLanguage);

  const disease = getLocalizedDisease(diseaseId, currentLanguage);
  const plantImages = images && images.length > 0 ? images : disease.sampleImages;

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [focusedBtn, setFocusedBtn] = useState(null);

  const photoLabels = [strings.slot1, strings.slot2, strings.slot3, strings.slot4];

  // Helper to get localized labels for farmer data chips
  const getLandLabel = (landKey) => {
    if (landKey === '0.5_acre') return strings.landHalfAcre;
    if (landKey === '1_acre') return strings.land1Acre;
    if (landKey === '2_acres') return strings.land2Acres;
    if (landKey === '5_acres') return strings.land5Acres;
    return strings.land1Acre;
  };

  const getAgeLabel = (ageKey) => {
    if (ageKey === 'seedling') return strings.ageSeedling;
    if (ageKey === 'vegetative') return strings.ageVegetative;
    if (ageKey === 'flowering') return strings.ageFlowering;
    if (ageKey === 'fruiting') return strings.ageFruiting;
    return strings.ageVegetative;
  };

  const getVarietyLabel = (varietyKey) => {
    if (varietyKey === 'hybrid') return strings.varietyHybrid;
    if (varietyKey === 'desi') return strings.varietyDesi;
    if (varietyKey === 'polyhouse') return strings.varietyPolyhouse;
    if (varietyKey === 'open_field') return strings.varietyOpenField;
    return strings.varietyHybrid;
  };

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const handleToggleAudio = async () => {
    if (isPlayingAudio) {
      await stopSpeech();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speakFarmerAdvice(
        disease.speechNarration,
        currentLanguage,
        () => setIsPlayingAudio(false),
        () => setIsPlayingAudio(false)
      );
    }
  };

  const handleAccessibleAction = (btnId, spokenText, actionFn) => {
    if (!talkbackEnabled) {
      actionFn();
      return;
    }

    if (focusedBtn === btnId) {
      setFocusedBtn(null);
      actionFn();
    } else {
      setFocusedBtn(btnId);
      speakFarmerAdvice(`${spokenText}. ${strings.tapAgainToOpen}`, currentLanguage);
    }
  };

  const handleBackPress = async () => {
    await stopSpeech();
    setIsPlayingAudio(false);
    onBackToHome();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={colors.primaryDark} barStyle="light-content" />

      <Header
        title={disease.cropName}
        onBack={handleBackPress}
        activeLanguage={activeLangObj}
        onChangeLanguage={onChangeLanguage}
        showLanguageBadge={true}
        talkbackEnabled={talkbackEnabled}
        onToggleTalkback={onToggleTalkback}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Selected Photo */}
        <View style={styles.heroCard}>
          <Image
            source={{ uri: plantImages[activePhotoIdx] || disease.sampleImages[0] }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Top Overlays */}
          <View style={styles.heroOverlayTop}>
            <View style={styles.confidenceChip}>
              <MaterialCommunityIcons name="bullseye-arrow" size={16} color={colors.white} />
              <Text style={styles.confidenceText}>{disease.confidence}</Text>
            </View>
            <SeverityBadge severity={disease.severity} />
          </View>

          {/* Bottom Title - Disease Name */}
          <View style={styles.heroTitleBanner}>
            <Text style={styles.diseaseTitle}>{disease.diseaseName}</Text>
            <Text style={styles.scientificTitle}>{disease.scientificName}</Text>
          </View>
        </View>

        {/* Farmer Field Data Chips */}
        {farmerData && (
          <View style={styles.farmerChipsRow}>
            <View style={styles.farmerChip}>
              <MaterialCommunityIcons name="land-rows-horizontal" size={16} color="#059669" />
              <Text style={styles.farmerChipText}>{getLandLabel(farmerData.land)}</Text>
            </View>
            <View style={styles.farmerChip}>
              <MaterialCommunityIcons name="calendar-clock" size={16} color="#0284C7" />
              <Text style={styles.farmerChipText}>{getAgeLabel(farmerData.age)}</Text>
            </View>
            <View style={styles.farmerChip}>
              <MaterialCommunityIcons name="food-apple" size={16} color="#D97706" />
              <Text style={styles.farmerChipText}>{getVarietyLabel(farmerData.variety)}</Text>
            </View>
          </View>
        )}

        {/* 4 Infected Leaf Thumbnails (Max 3 words: e.g. Leaf 1) */}
        <View style={styles.thumbnailStrip}>
          {plantImages.slice(0, 4).map((uri, idx) => {
            const isSelected = activePhotoIdx === idx;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.thumbCard, isSelected && styles.thumbCardSelected]}
                onPress={() => {
                  setActivePhotoIdx(idx);
                  if (talkbackEnabled) {
                    speakFarmerAdvice(photoLabels[idx], currentLanguage);
                  }
                }}
                activeOpacity={0.8}
              >
                <Image source={{ uri }} style={styles.thumbImg} resizeMode="cover" />
                <Text style={[styles.thumbLabel, isSelected && styles.thumbLabelSelected]} numberOfLines={1}>
                  {photoLabels[idx]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Big Audio Readout Button (2 words: Listen Advice / Stop Advice) */}
        <TouchableOpacity
          style={[
            styles.audioButton,
            isPlayingAudio && styles.audioButtonActive,
            focusedBtn === 'audio' && styles.btnFocused,
          ]}
          onPress={() =>
            handleAccessibleAction(
              'audio',
              isPlayingAudio ? strings.stopAdvice : strings.listenAdvice,
              handleToggleAudio
            )
          }
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={isPlayingAudio ? 'stop-circle' : 'volume-high'}
            size={32}
            color={isPlayingAudio ? '#DC2626' : '#059669'}
          />
          <Text style={[styles.audioButtonText, isPlayingAudio && styles.audioButtonTextActive]}>
            {isPlayingAudio ? strings.stopAdvice : strings.listenAdvice}
          </Text>
        </TouchableOpacity>

        {/* Card 1: Organic Action (Max 2-3 words title with icon) */}
        <View style={[styles.card, { borderLeftColor: '#059669' }]}>
          <View style={[styles.cardHeader, { backgroundColor: '#ECFDF5' }]}>
            <MaterialCommunityIcons name="leaf" size={24} color="#059669" />
            <Text style={styles.cardHeaderTitle}>{strings.organicTitle}</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardText}>{disease.immediateOrganicAction}</Text>
          </View>
        </View>

        {/* Card 2: Chemical Spray (Max 2-3 words title with icon) */}
        <View style={[styles.card, { borderLeftColor: '#D97706' }]}>
          <View style={[styles.cardHeader, { backgroundColor: '#FEF3C7' }]}>
            <MaterialCommunityIcons name="flask" size={24} color="#D97706" />
            <Text style={styles.cardHeaderTitle}>{strings.chemicalTitle}</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardText}>{disease.chemicalDosage}</Text>
          </View>
        </View>

        {/* Card 3: Irrigation Tips (Max 2-3 words title with icon) */}
        <View style={[styles.card, { borderLeftColor: '#0284C7' }]}>
          <View style={[styles.cardHeader, { backgroundColor: '#E0F2FE' }]}>
            <MaterialCommunityIcons name="water" size={24} color="#0284C7" />
            <Text style={styles.cardHeaderTitle}>{strings.irrigationTitle}</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardText}>{disease.preventionIrrigation}</Text>
          </View>
        </View>

        {/* Bottom Button (2 words: Diagnose Another) */}
        <TouchableOpacity
          style={[styles.anotherButton, focusedBtn === 'another' && styles.btnFocused]}
          onPress={() =>
            handleAccessibleAction('another', strings.diagnoseAnother, handleBackPress)
          }
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="camera-plus" size={24} color={colors.white} />
          <Text style={styles.anotherButtonText}>{strings.diagnoseAnother}</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.primaryDark,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: 220,
    backgroundColor: colors.slate900,
  },
  heroOverlayTop: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 44, 34, 0.9)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#34D399',
  },
  confidenceText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: typography.weightBold,
    marginLeft: 4,
  },
  heroTitleBanner: {
    padding: 14,
    backgroundColor: colors.white,
    borderTopWidth: 2,
    borderTopColor: colors.slate200,
  },
  diseaseTitle: {
    fontSize: 22,
    fontWeight: typography.weightBold,
    color: colors.slate950,
  },
  scientificTitle: {
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.slate600,
    marginTop: 2,
  },
  farmerChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 12,
  },
  farmerChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.slate300,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  farmerChipText: {
    fontSize: 11,
    fontWeight: typography.weightBold,
    color: colors.slate800,
    marginLeft: 4,
  },
  thumbnailStrip: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  thumbCard: {
    width: '23%',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.slate300,
    overflow: 'hidden',
    alignItems: 'center',
  },
  thumbCardSelected: {
    borderColor: colors.primaryDark,
    borderWidth: 2.5,
  },
  thumbImg: {
    width: '100%',
    height: 60,
  },
  thumbLabel: {
    fontSize: 11,
    fontWeight: typography.weightBold,
    color: colors.slate700,
    paddingVertical: 4,
    paddingHorizontal: 2,
    textAlign: 'center',
  },
  thumbLabelSelected: {
    color: colors.primaryDark,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
    borderRadius: 14,
    minHeight: 56,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primaryDarkest,
    elevation: 4,
  },
  audioButtonActive: {
    backgroundColor: '#7F1D1D',
    borderColor: '#DC2626',
  },
  audioButtonText: {
    fontSize: 19,
    fontWeight: typography.weightBold,
    color: colors.white,
    marginLeft: 10,
  },
  audioButtonTextActive: {
    color: '#FEE2E2',
  },
  btnFocused: {
    borderColor: '#F59E0B',
    borderWidth: 3.5,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.slate300,
    borderLeftWidth: 6,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.slate200,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: typography.weightBold,
    color: colors.slate950,
    marginLeft: 8,
  },
  cardBody: {
    padding: 14,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.slate800,
    fontWeight: typography.weightMedium,
  },
  anotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.slate900,
    borderRadius: 14,
    minHeight: 54,
    paddingHorizontal: 18,
    marginTop: 6,
    marginBottom: 20,
    elevation: 4,
  },
  anotherButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: typography.weightBold,
    marginLeft: 8,
  },
});

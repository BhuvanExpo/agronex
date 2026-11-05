import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, dimensions } from '../utils/theme';
import { UI_STRINGS, SUPPORTED_LANGUAGES } from '../data/languages';
import Header from '../components/Header';
import { speakFarmerAdvice, stopSpeech } from '../utils/audio';

export default function FarmerDetailsScreen({
  currentLanguage = 'en',
  onBack,
  onSubmitData,
  onChangeLanguage,
  talkbackEnabled,
  onToggleTalkback,
  isOfflineMode = false,
}) {
  const strings = UI_STRINGS[currentLanguage] || UI_STRINGS.en;
  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.id === currentLanguage);

  const [selectedLand, setSelectedLand] = useState('1_acre');
  const [selectedAge, setSelectedAge] = useState('vegetative');
  const [selectedVariety, setSelectedVariety] = useState('hybrid');

  const [focusedItemId, setFocusedItemId] = useState(null);

  const landOptions = [
    { id: '0.5_acre', label: strings.landHalfAcre, icon: 'texture-box' },
    { id: '1_acre', label: strings.land1Acre, icon: 'land-rows-horizontal' },
    { id: '2_acres', label: strings.land2Acres, icon: 'terrain' },
    { id: '5_acres', label: strings.land5Acres, icon: 'image-filter-hdr' },
  ];

  const ageOptions = [
    { id: 'seedling', label: strings.ageSeedling, icon: 'sprout' },
    { id: 'vegetative', label: strings.ageVegetative, icon: 'leaf' },
    { id: 'flowering', label: strings.ageFlowering, icon: 'flower' },
    { id: 'fruiting', label: strings.ageFruiting, icon: 'food-apple' },
  ];

  const varietyOptions = [
    { id: 'hybrid', label: strings.varietyHybrid, icon: 'shield-check' },
    { id: 'desi', label: strings.varietyDesi, icon: 'seed' },
    { id: 'polyhouse', label: strings.varietyPolyhouse, icon: 'home-roof' },
    { id: 'open_field', label: strings.varietyOpenField, icon: 'weather-sunny' },
  ];

  // TalkBack 2-click pattern: 1st tap speaks, 2nd tap selects!
  const handleSelectOption = (category, item) => {
    if (!talkbackEnabled) {
      if (category === 'land') setSelectedLand(item.id);
      if (category === 'age') setSelectedAge(item.id);
      if (category === 'variety') setSelectedVariety(item.id);
      return;
    }

    if (focusedItemId === item.id) {
      setFocusedItemId(null);
      if (category === 'land') setSelectedLand(item.id);
      if (category === 'age') setSelectedAge(item.id);
      if (category === 'variety') setSelectedVariety(item.id);
    } else {
      setFocusedItemId(item.id);
      speakFarmerAdvice(`${item.label}. ${strings.tapAgainToOpen}`, currentLanguage);
    }
  };

  const handleSubmit = () => {
    if (!talkbackEnabled) {
      stopSpeech();
      onSubmitData({
        land: selectedLand,
        age: selectedAge,
        variety: selectedVariety,
      });
      return;
    }

    if (focusedItemId === 'submit') {
      setFocusedItemId(null);
      stopSpeech();
      onSubmitData({
        land: selectedLand,
        age: selectedAge,
        variety: selectedVariety,
      });
    } else {
      setFocusedItemId('submit');
      speakFarmerAdvice(`${strings.analyzeTomato}. ${strings.tapAgainToOpen}`, currentLanguage);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, isOfflineMode && { backgroundColor: '#FEF2F2' }]}>
      <Header
        title={isOfflineMode ? `${strings.farmerDataTitle} (OFFLINE)` : strings.farmerDataTitle}
        onBack={onBack}
        activeLanguage={activeLangObj}
        onChangeLanguage={onChangeLanguage}
        showLanguageBadge={true}
        talkbackEnabled={talkbackEnabled}
        onToggleTalkback={onToggleTalkback}
        isOffline={isOfflineMode}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section 1: Land Size (Max 3 words per option) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="vector-square" size={22} color={colors.primaryDark} />
            <Text style={styles.sectionTitle}>{strings.landSizeTitle}</Text>
          </View>
          <View style={styles.optionsGrid}>
            {landOptions.map((item) => {
              const isSelected = selectedLand === item.id;
              const isFocused = focusedItemId === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.tile,
                    isSelected && styles.tileSelected,
                    isFocused && styles.tileFocused,
                  ]}
                  onPress={() => handleSelectOption('land', item)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={28}
                    color={isSelected ? colors.white : colors.primaryDark}
                  />
                  <Text style={[styles.tileLabel, isSelected && styles.tileLabelSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 2: Plant Age (Max 3 words per option) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="calendar-clock" size={22} color={colors.primaryDark} />
            <Text style={styles.sectionTitle}>{strings.plantAgeTitle}</Text>
          </View>
          <View style={styles.optionsGrid}>
            {ageOptions.map((item) => {
              const isSelected = selectedAge === item.id;
              const isFocused = focusedItemId === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.tile,
                    isSelected && styles.tileSelected,
                    isFocused && styles.tileFocused,
                  ]}
                  onPress={() => handleSelectOption('age', item)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={28}
                    color={isSelected ? colors.white : colors.primaryDark}
                  />
                  <Text style={[styles.tileLabel, isSelected && styles.tileLabelSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 3: Tomato Variety (Max 3 words per option) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="food-apple" size={22} color={colors.primaryDark} />
            <Text style={styles.sectionTitle}>{strings.plantTypeTitle}</Text>
          </View>
          <View style={styles.optionsGrid}>
            {varietyOptions.map((item) => {
              const isSelected = selectedVariety === item.id;
              const isFocused = focusedItemId === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.tile,
                    isSelected && styles.tileSelected,
                    isFocused && styles.tileFocused,
                  ]}
                  onPress={() => handleSelectOption('variety', item)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={28}
                    color={isSelected ? colors.white : colors.primaryDark}
                  />
                  <Text style={[styles.tileLabel, isSelected && styles.tileLabelSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Button (Max 2 words: Diagnose Tomato) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            focusedItemId === 'submit' && styles.submitBtnFocused,
          ]}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="microscope" size={26} color={colors.white} />
          <Text style={styles.submitBtnText}>{strings.analyzeTomato}</Text>
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
    paddingBottom: 100,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.slate300,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: typography.weightBold,
    color: colors.slate950,
    marginLeft: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  tile: {
    width: '48%',
    backgroundColor: colors.slate100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.slate300,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 82,
    justifyContent: 'center',
  },
  tileSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDarkest,
    elevation: 3,
  },
  tileFocused: {
    borderColor: '#F59E0B',
    borderWidth: 3.5,
  },
  tileLabel: {
    fontSize: 13,
    fontWeight: typography.weightBold,
    color: colors.slate900,
    textAlign: 'center',
    marginTop: 6,
  },
  tileLabelSelected: {
    color: colors.white,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: 14,
    borderTopWidth: 2,
    borderTopColor: colors.slate300,
    elevation: 8,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
    borderRadius: 14,
    minHeight: dimensions.buttonHeight,
    paddingHorizontal: 16,
    elevation: 4,
  },
  submitBtnFocused: {
    borderColor: '#F59E0B',
    borderWidth: 3.5,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: 19,
    fontWeight: typography.weightBold,
    marginLeft: 8,
  },
});

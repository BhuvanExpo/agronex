import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, BackHandler } from 'react-native';
import LanguageScreen from './src/screens/LanguageScreen';
import HomeScreen from './src/screens/HomeScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import FarmerDetailsScreen from './src/screens/FarmerDetailsScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import AdvisoryScreen from './src/screens/AdvisoryScreen';
import { stopSpeech } from './src/utils/audio';
import { colors } from './src/utils/theme';

export default function App() {
  // Screen state flow: 'language' -> 'home' -> 'preview' -> 'farmer_details' -> 'loading' -> 'advisory'
  const [currentScreen, setCurrentScreen] = useState('language');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [talkbackEnabled, setTalkbackEnabled] = useState(false);

  // 4 Plant Photos: [Top Leaf, Under Leaf, Stem, Whole Plant]
  const [selectedImages, setSelectedImages] = useState([]);
  const [activeDiseaseId, setActiveDiseaseId] = useState('tuta_absoluta');
  const [analysisResult, setAnalysisResult] = useState(null);

  // Farmer Field Details: land, plant age, variety
  const [farmerData, setFarmerData] = useState({
    land: '1_acre',
    age: 'vegetative',
    variety: 'hybrid',
  });

  // Handle hardware Android Back Button properly
  useEffect(() => {
    const onBackPress = () => {
      stopSpeech();

      if (currentScreen === 'advisory') {
        setCurrentScreen('home');
        return true;
      }
      if (currentScreen === 'loading') {
        setCurrentScreen('farmer_details');
        return true;
      }
      if (currentScreen === 'farmer_details') {
        setCurrentScreen('preview');
        return true;
      }
      if (currentScreen === 'preview') {
        setCurrentScreen('home');
        return true;
      }
      if (currentScreen === 'home') {
        setCurrentScreen('language');
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      subscription.remove();
      stopSpeech();
    };
  }, [currentScreen]);

  // Screen 1: Language selection continue handler
  const handleLanguageContinue = () => {
    stopSpeech();
    setCurrentScreen('home');
  };

  // Screen 2: 4 images captured or selected
  const handleImagesSelected = (imagesList, diseaseIdHint = null) => {
    stopSpeech();
    setSelectedImages(imagesList);

    if (diseaseIdHint) {
      setActiveDiseaseId(diseaseIdHint);
    }
    setAnalysisResult(null);

    setCurrentScreen('preview');
  };

  // Screen 3: Retake / cancel preview
  const handleRetake = () => {
    stopSpeech();
    setSelectedImages([]);
    setCurrentScreen('home');
  };

  // Screen 3 -> Screen 4: Proceed to Farmer Details
  const handleProceedToDetails = () => {
    stopSpeech();
    setCurrentScreen('farmer_details');
  };

  // Screen 4 -> Screen 5: Submit Farmer Details & Start Diagnosis
  const handleFarmerDataSubmit = (data) => {
    stopSpeech();
    setFarmerData(data);
    setCurrentScreen('loading');
  };

  // Screen 5 -> Screen 6: Model analysis finished
  const handleAnalysisComplete = (result = null) => {
    stopSpeech();
    if (result) {
      if (result.disease_id) {
        setActiveDiseaseId(result.disease_id);
      }
      setAnalysisResult(result);
    }
    setCurrentScreen('advisory');
  };

  // Screen 6 -> Screen 2: Back to home
  const handleBackToHome = () => {
    stopSpeech();
    setSelectedImages([]);
    setCurrentScreen('home');
  };

  // Global change language trigger
  const handleChangeLanguage = () => {
    stopSpeech();
    setCurrentScreen('language');
  };

  const handleToggleTalkback = () => {
    setTalkbackEnabled((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={colors.primaryDark} />

      {currentScreen === 'language' && (
        <LanguageScreen
          selectedLanguage={selectedLanguage}
          onSelectLanguage={(langId) => setSelectedLanguage(langId)}
          onContinue={handleLanguageContinue}
          talkbackEnabled={talkbackEnabled}
          onToggleTalkback={handleToggleTalkback}
        />
      )}

      {currentScreen === 'home' && (
        <HomeScreen
          currentLanguage={selectedLanguage}
          onChangeLanguage={handleChangeLanguage}
          onImagesSelected={handleImagesSelected}
          talkbackEnabled={talkbackEnabled}
          onToggleTalkback={handleToggleTalkback}
        />
      )}

      {currentScreen === 'preview' && (
        <PreviewScreen
          images={selectedImages}
          currentLanguage={selectedLanguage}
          onRetake={handleRetake}
          onProceedToDetails={handleProceedToDetails}
          onChangeLanguage={handleChangeLanguage}
          talkbackEnabled={talkbackEnabled}
          onToggleTalkback={handleToggleTalkback}
        />
      )}

      {currentScreen === 'farmer_details' && (
        <FarmerDetailsScreen
          currentLanguage={selectedLanguage}
          onBack={() => setCurrentScreen('preview')}
          onSubmitData={handleFarmerDataSubmit}
          onChangeLanguage={handleChangeLanguage}
          talkbackEnabled={talkbackEnabled}
          onToggleTalkback={handleToggleTalkback}
        />
      )}

      {currentScreen === 'loading' && (
        <LoadingScreen
          images={selectedImages}
          currentLanguage={selectedLanguage}
          farmerData={farmerData}
          fallbackHint={activeDiseaseId}
          onAnalysisComplete={handleAnalysisComplete}
        />
      )}

      {currentScreen === 'advisory' && (
        <AdvisoryScreen
          images={selectedImages}
          diseaseId={activeDiseaseId}
          analysisResult={analysisResult}
          farmerData={farmerData}
          currentLanguage={selectedLanguage}
          onBackToHome={handleBackToHome}
          onChangeLanguage={handleChangeLanguage}
          talkbackEnabled={talkbackEnabled}
          onToggleTalkback={handleToggleTalkback}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate50,
  },
});

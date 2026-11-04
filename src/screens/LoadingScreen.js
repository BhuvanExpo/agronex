import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography } from '../utils/theme';
import { UI_STRINGS } from '../data/languages';
import { speakFarmerAdvice, stopSpeech } from '../utils/audio';
import { runTomatoModelInference } from '../utils/modelInference';

const { width } = Dimensions.get('window');

export default function LoadingScreen({
  images = [],
  currentLanguage = 'en',
  farmerData = null,
  fallbackHint = null,
  onAnalysisComplete,
}) {
  const strings = UI_STRINGS[currentLanguage] || UI_STRINGS.en;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;
    speakFarmerAdvice(strings.analyzingVoice, currentLanguage);

    const scanningAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 240,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    scanningAnimation.start();

    const startTime = Date.now();

    // Call PyTorch ResNet-50 inference asynchronously with uploaded images & farmer data (including language)
    const enrichedFarmerData = { ...(farmerData || {}), language: currentLanguage };
    runTomatoModelInference(images, enrichedFarmerData, fallbackHint)
      .then((inferenceResult) => {
        if (!isMounted) return;
        const elapsed = Date.now() - startTime;
        const minScanDuration = 2200; // Ensure farmers see the high-tech scanning laser
        const remainingDelay = Math.max(100, minScanDuration - elapsed);

        setTimeout(() => {
          if (isMounted) {
            stopSpeech();
            onAnalysisComplete(inferenceResult);
          }
        }, remainingDelay);
      })
      .catch((err) => {
        console.warn('Inference pipeline error:', err);
        if (isMounted) {
          stopSpeech();
          onAnalysisComplete(null);
        }
      });

    return () => {
      isMounted = false;
      scanningAnimation.stop();
      stopSpeech();
    };
  }, [currentLanguage]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Title: Max 3 words */}
        <Text style={styles.title}>{strings.analyzingTitle}</Text>

        {/* 4 Images Scanning Grid */}
        <View style={styles.scanBox}>
          <View style={styles.imagesMiniGrid}>
            {images.slice(0, 4).map((item, i) => {
              const imgUri = typeof item === 'string' ? item : item?.uri;
              return (
                <View key={i} style={styles.miniSlot}>
                  {imgUri ? (
                    <Image source={{ uri: imgUri }} style={styles.miniImg} resizeMode="cover" />
                  ) : (
                    <View style={styles.miniPlaceholder}>
                      <MaterialCommunityIcons name="leaf" size={24} color="#34D399" />
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Laser Scanning Line */}
          <Animated.View
            style={[
              styles.laserLine,
              {
                transform: [{ translateY: scanLineAnim }],
              },
            ]}
          >
            <View style={styles.laserBeam} />
          </Animated.View>
        </View>

        {/* Indicator */}
        <View style={styles.indicatorWrap}>
          <ActivityIndicator size="large" color="#34D399" />
          <Text style={styles.subtitleText}>PyTorch ResNet-50</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#022C22',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: typography.weightBold,
    color: colors.white,
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  scanBox: {
    width: width - 48,
    height: 250,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#34D399',
    backgroundColor: colors.slate950,
    position: 'relative',
    elevation: 8,
  },
  imagesMiniGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  miniSlot: {
    width: '50%',
    height: '50%',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  miniImg: {
    width: '100%',
    height: '100%',
  },
  miniPlaceholder: {
    flex: 1,
    backgroundColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  laserLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 4,
  },
  laserBeam: {
    height: 4,
    backgroundColor: '#34D399',
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
  indicatorWrap: {
    marginTop: 28,
    alignItems: 'center',
  },
  subtitleText: {
    marginTop: 10,
    color: '#34D399',
    fontSize: 14,
    fontWeight: typography.weightBold,
    letterSpacing: 0.5,
  },
});

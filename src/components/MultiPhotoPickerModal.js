import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
  Linking,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, dimensions } from '../utils/theme';
import { UI_STRINGS } from '../data/languages';
import { speakFarmerAdvice, stopSpeech } from '../utils/audio';

export default function MultiPhotoPickerModal({
  visible,
  mode = 'camera', // 'camera' | 'gallery'
  onClose,
  onPhotosConfirmed,
  currentLanguage = 'en',
  talkbackEnabled = false,
}) {
  const strings = UI_STRINGS[currentLanguage] || UI_STRINGS.en;

  // 4 Infected Leaf Slots
  const [slotImages, setSlotImages] = useState([null, null, null, null]);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [focusedSlotIndex, setFocusedSlotIndex] = useState(null);

  const slotLabels = [strings.slot1, strings.slot2, strings.slot3, strings.slot4];

  useEffect(() => {
    if (visible) {
      setSlotImages([null, null, null, null]);
      setActiveSlotIndex(0);
      setFocusedSlotIndex(null);

      if (mode === 'camera') {
        launchCameraForSlot(0);
      } else {
        launchGalleryMultiPick();
      }
    }
  }, [visible, mode]);

  const launchCameraForSlot = async (slotIdx) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(strings.cameraPermTitle, strings.cameraPermMessage, [
          { text: strings.cancel, style: 'cancel' },
          {
            text: strings.grantPermission,
            onPress: () => {
              if (Platform.OS === 'android') Linking.openSettings().catch(() => {});
            },
          },
        ]);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setSlotImages((prev) => {
          const next = [...prev];
          next[slotIdx] = uri;
          return next;
        });

        // Advance to next slot automatically if empty
        const nextEmpty = slotIdx + 1;
        if (nextEmpty < 4) {
          setActiveSlotIndex(nextEmpty);
          setTimeout(() => {
            launchCameraForSlot(nextEmpty);
          }, 500);
        } else {
          if (talkbackEnabled) {
            speakFarmerAdvice(strings.confirm4Photos, currentLanguage);
          }
        }
      }
    } catch (err) {
      console.warn('Camera capture error:', err);
    }
  };

  const launchGalleryMultiPick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(strings.galleryPermTitle, strings.galleryPermMessage, [
          { text: strings.cancel, style: 'cancel' },
        ]);
        return;
      }

      const mediaTypesOption = ImagePicker.MediaTypeOptions
        ? ImagePicker.MediaTypeOptions.Images
        : ['images'];

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaTypesOption,
        allowsMultipleSelection: true,
        selectionLimit: 4,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedUris = result.assets.map((a) => a.uri);

        setSlotImages((prev) => {
          const next = [...prev];
          for (let i = 0; i < 4 && i < pickedUris.length; i++) {
            next[i] = pickedUris[i];
          }
          return next;
        });

        if (pickedUris.length >= 4 && talkbackEnabled) {
          speakFarmerAdvice(strings.confirm4Photos, currentLanguage);
        }
      }
    } catch (err) {
      console.warn('Gallery pick error:', err);
    }
  };

  const launchSingleGalleryPick = async (slotIdx) => {
    try {
      const mediaTypesOption = ImagePicker.MediaTypeOptions
        ? ImagePicker.MediaTypeOptions.Images
        : ['images'];

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaTypesOption,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setSlotImages((prev) => {
          const next = [...prev];
          next[slotIdx] = uri;
          return next;
        });
      }
    } catch (err) {
      console.warn('Single pick error:', err);
    }
  };

  // TalkBack 2-click pattern: 1st tap speaks, 2nd tap acts!
  const handleSlotPress = (index) => {
    const slotLabel = slotLabels[index];

    if (!talkbackEnabled) {
      // Normal single tap
      setActiveSlotIndex(index);
      if (mode === 'camera') {
        launchCameraForSlot(index);
      } else {
        launchSingleGalleryPick(index);
      }
      return;
    }

    // TalkBack ON:
    if (focusedSlotIndex === index) {
      // 2nd tap on the same slot -> execute!
      setFocusedSlotIndex(null);
      setActiveSlotIndex(index);
      if (mode === 'camera') {
        launchCameraForSlot(index);
      } else {
        launchSingleGalleryPick(index);
      }
    } else {
      // 1st tap -> speak & focus!
      setFocusedSlotIndex(index);
      const textToSpeak = `${slotLabel}. ${strings.tapAgainToOpen}`;
      speakFarmerAdvice(textToSpeak, currentLanguage);
    }
  };

  const isComplete = slotImages.every((img) => img !== null);

  const handleConfirmPress = () => {
    if (!isComplete) {
      Alert.alert(strings.need4PhotosAlert);
      return;
    }

    if (!talkbackEnabled) {
      onPhotosConfirmed(slotImages);
      return;
    }

    if (focusedSlotIndex === 'confirm') {
      setFocusedSlotIndex(null);
      onPhotosConfirmed(slotImages);
    } else {
      setFocusedSlotIndex('confirm');
      speakFarmerAdvice(`${strings.confirm4Photos}. ${strings.tapAgainToOpen}`, currentLanguage);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <MaterialCommunityIcons name="arrow-left" size={26} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>
              {mode === 'camera' ? strings.take4Photos : strings.upload4Photos}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* 4 Infected Leaf Slots (Standard Plus Icon when empty) */}
          <View style={styles.slotsGrid}>
            {slotLabels.map((label, idx) => {
              const imageUri = slotImages[idx];
              const isFocused = focusedSlotIndex === idx;

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.slotCard,
                    isFocused && styles.slotCardFocused,
                    imageUri && styles.slotCardFilled,
                  ]}
                  onPress={() => handleSlotPress(idx)}
                  activeOpacity={0.8}
                >
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.slotImage} resizeMode="cover" />
                  ) : (
                    /* Standard Plus Icon for Empty Slot */
                    <View style={styles.emptySlotContent}>
                      <View style={styles.plusCircle}>
                        <MaterialCommunityIcons name="plus" size={40} color={colors.primaryDark} />
                      </View>
                      <Text style={styles.addText}>{strings.addLeafPhoto}</Text>
                    </View>
                  )}

                  {/* Slot Name Under Icon (Max 2 words: e.g. Leaf 1) */}
                  <View style={styles.slotFooter}>
                    <View style={styles.slotTitleRow}>
                      <MaterialCommunityIcons
                        name="leaf"
                        size={18}
                        color={imageUri ? '#059669' : colors.primaryDark}
                      />
                      <Text style={styles.slotTitle} numberOfLines={1}>
                        {label}
                      </Text>
                    </View>

                    {imageUri ? (
                      <View style={styles.checkPill}>
                        <MaterialCommunityIcons name="check-bold" size={14} color={colors.white} />
                      </View>
                    ) : (
                      <MaterialCommunityIcons name="camera" size={18} color={colors.slate400} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Bar: Confirm Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              !isComplete && styles.confirmBtnDisabled,
              focusedSlotIndex === 'confirm' && styles.confirmBtnFocused,
            ]}
            onPress={handleConfirmPress}
            activeOpacity={0.8}
            disabled={!isComplete}
          >
            <MaterialCommunityIcons name="check-circle" size={24} color={colors.white} />
            <Text style={styles.confirmBtnText}>{strings.confirm4Photos}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate50,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    paddingTop: Platform.OS === 'android' ? 36 : 48,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 3,
    borderBottomColor: colors.primaryDarkest,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: typography.weightBold,
  },
  content: {
    padding: 14,
    paddingBottom: 100,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  slotCard: {
    width: '48%',
    height: 220,
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: colors.slate300,
    overflow: 'hidden',
    elevation: 3,
    justifyContent: 'space-between',
  },
  slotCardFocused: {
    borderColor: '#F59E0B',
    borderWidth: 3.5,
    elevation: 6,
  },
  slotCardFilled: {
    borderColor: '#059669',
  },
  emptySlotContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderStyle: 'dashed',
  },
  plusCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  addText: {
    fontSize: 13,
    fontWeight: typography.weightBold,
    color: colors.primaryDark,
    marginTop: 8,
  },
  slotImage: {
    width: '100%',
    height: 165,
    backgroundColor: colors.slate900,
  },
  slotFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1.5,
    borderTopColor: colors.slate200,
    minHeight: 48,
  },
  slotTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  slotTitle: {
    fontSize: 14,
    fontWeight: typography.weightBold,
    color: colors.slate950,
    marginLeft: 6,
  },
  checkPill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
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
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
    borderRadius: 14,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  confirmBtnFocused: {
    borderColor: '#F59E0B',
    borderWidth: 3,
  },
  confirmBtnDisabled: {
    backgroundColor: colors.slate400,
  },
  confirmBtnText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: typography.weightBold,
    marginLeft: 8,
  },
});

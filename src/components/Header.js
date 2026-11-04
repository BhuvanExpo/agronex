import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, dimensions } from '../utils/theme';

export default function Header({
  title,
  onBack,
  activeLanguage,
  onChangeLanguage,
  showLanguageBadge = true,
  talkbackEnabled = false,
  onToggleTalkback,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {onBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="arrow-left" size={26} color={colors.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.brandIconWrapper}>
            <MaterialCommunityIcons name="sprout" size={26} color="#34D399" />
          </View>
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* TalkBack Toggle Button */}
        {onToggleTalkback && (
          <TouchableOpacity
            style={[
              styles.talkbackBtn,
              talkbackEnabled ? styles.talkbackBtnActive : styles.talkbackBtnInactive,
            ]}
            onPress={onToggleTalkback}
            activeOpacity={0.8}
            accessibilityRole="switch"
            accessibilityState={{ checked: talkbackEnabled }}
            accessibilityLabel={talkbackEnabled ? 'TalkBack ON' : 'TalkBack OFF'}
          >
            <MaterialCommunityIcons
              name={talkbackEnabled ? 'volume-high' : 'volume-off'}
              size={18}
              color={talkbackEnabled ? '#022C22' : colors.white}
            />
            <Text
              style={[
                styles.talkbackText,
                talkbackEnabled ? styles.talkbackTextActive : styles.talkbackTextInactive,
              ]}
            >
              {talkbackEnabled ? 'TALK ON' : 'TALK OFF'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Language Switch Pill */}
        {showLanguageBadge && (
          <TouchableOpacity
            style={styles.langPill}
            onPress={onChangeLanguage}
            activeOpacity={0.8}
            accessibilityLabel="Change language"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="web" size={16} color="#A7F3D0" />
            <Text style={styles.langText}>
              {activeLanguage ? activeLanguage.nativeName : 'Lang'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryDark,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 6 : 44,
    paddingBottom: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 3,
    borderBottomColor: colors.primaryDarkest,
    elevation: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: dimensions.minTouchTarget,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  brandIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryDarkest,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#34D399',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: colors.white,
    fontSize: 20,
    fontWeight: typography.weightBold,
    letterSpacing: 0.3,
  },
  talkbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1.5,
    marginRight: 6,
    minHeight: 36,
  },
  talkbackBtnActive: {
    backgroundColor: '#34D399',
    borderColor: colors.white,
  },
  talkbackBtnInactive: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: colors.slate400,
  },
  talkbackText: {
    fontSize: 11,
    fontWeight: typography.weightBold,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  talkbackTextActive: {
    color: '#022C22',
  },
  talkbackTextInactive: {
    color: colors.slate300,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryDarkest,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#34D399',
    minHeight: 36,
  },
  langText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: typography.weightBold,
    marginLeft: 4,
  },
});

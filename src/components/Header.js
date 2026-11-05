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
  onOpenServerSettings,
  serverOnline = null,
  isOffline = false,
}) {
  return (
    <View style={[styles.container, isOffline && styles.containerOffline]}>
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
          <View style={[styles.brandIconWrapper, isOffline && styles.brandIconWrapperOffline]}>
            <MaterialCommunityIcons
              name={isOffline ? 'cellphone-off' : 'sprout'}
              size={26}
              color={isOffline ? '#FCA5A5' : '#34D399'}
            />
          </View>
        )}

        <View style={styles.titleContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {isOffline && (
              <View style={styles.offlinePillBadge}>
                <Text style={styles.offlinePillText}>OFFLINE</Text>
              </View>
            )}
          </View>
        </View>

        {/* Server Connection Settings Button */}
        {onOpenServerSettings && (
          <TouchableOpacity
            style={[
              styles.serverBtn,
              serverOnline === true
                ? styles.serverBtnOnline
                : serverOnline === false
                ? styles.serverBtnOffline
                : styles.serverBtnDefault,
            ]}
            onPress={onOpenServerSettings}
            activeOpacity={0.8}
            accessibilityLabel="Configure AI Server Connection"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name={
                serverOnline === true
                  ? 'cloud-check'
                  : serverOnline === false
                  ? 'cloud-alert'
                  : 'server-network'
              }
              size={18}
              color={
                serverOnline === true
                  ? '#34D399'
                  : serverOnline === false
                  ? '#F87171'
                  : '#A7F3D0'
              }
            />
          </TouchableOpacity>
        )}

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
  containerOffline: {
    backgroundColor: '#991B1B',
    borderBottomColor: '#7F1D1D',
  },
  brandIconWrapperOffline: {
    backgroundColor: '#7F1D1D',
    borderColor: '#EF4444',
  },
  offlinePillBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  offlinePillText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
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
  serverBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  serverBtnOnline: {
    backgroundColor: 'rgba(5, 150, 105, 0.3)',
    borderColor: '#34D399',
  },
  serverBtnOffline: {
    backgroundColor: 'rgba(220, 38, 38, 0.25)',
    borderColor: '#F87171',
  },
  serverBtnDefault: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
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

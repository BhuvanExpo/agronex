import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography } from '../utils/theme';

export default function SeverityBadge({ severity = 'Critical', customLabel = null }) {
  const normSeverity = (severity || '').toLowerCase();

  let badgeConfig = {
    bg: colors.criticalBg,
    text: colors.criticalText,
    border: colors.criticalBorder,
    icon: 'alert-circle',
    defaultLabel: 'Critical Severity',
  };

  if (normSeverity.includes('low') || normSeverity.includes('ಆರಂಭಿಕ') || normSeverity.includes('हल्का') || normSeverity.includes('స్వల్పం')) {
    badgeConfig = {
      bg: colors.lowBg,
      text: colors.lowText,
      border: colors.lowBorder,
      icon: 'check-circle-outline',
      defaultLabel: 'Low Severity',
    };
  } else if (normSeverity.includes('mod') || normSeverity.includes('ಮಧ್ಯಮ') || normSeverity.includes('मध्यम') || normSeverity.includes('మధ్యస్థం')) {
    badgeConfig = {
      bg: colors.moderateBg,
      text: colors.moderateText,
      border: colors.moderateBorder,
      icon: 'alert-triangle',
      defaultLabel: 'Moderate Severity',
    };
  }

  const label = customLabel || severity || badgeConfig.defaultLabel;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeConfig.bg,
          borderColor: badgeConfig.border,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={badgeConfig.icon}
        size={18}
        color={badgeConfig.text}
        style={styles.icon}
      />
      <Text style={[styles.text, { color: badgeConfig.text }]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: typography.weightBold,
    letterSpacing: 0.5,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, dimensions } from '../utils/theme';

export default function AdvisoryCard({
  title,
  content,
  iconName,
  themeType = 'organic', // 'organic' | 'chemical' | 'irrigation'
  highlightBox = null,
}) {
  let themeStyles = {
    headerBg: colors.primaryUltraLight,
    headerBorder: colors.primaryLight,
    iconColor: colors.primary,
    accentBorder: colors.primary,
  };

  if (themeType === 'chemical') {
    themeStyles = {
      headerBg: '#FEF3C7',
      headerBorder: '#FDE68A',
      iconColor: '#B45309',
      accentBorder: '#D97706',
    };
  } else if (themeType === 'irrigation') {
    themeStyles = {
      headerBg: colors.accentBlueBg,
      headerBorder: '#BAE6FD',
      iconColor: colors.accentBlue,
      accentBorder: colors.accentBlue,
    };
  }

  return (
    <View style={[styles.card, { borderLeftColor: themeStyles.accentBorder }]}>
      <View style={[styles.headerRow, { backgroundColor: themeStyles.headerBg, borderBottomColor: themeStyles.headerBorder }]}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={iconName} size={24} color={themeStyles.iconColor} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.contentText}>{content}</Text>

        {highlightBox ? (
          <View style={styles.dosageBox}>
            <MaterialCommunityIcons name="needle" size={20} color="#B45309" style={styles.dosageIcon} />
            <View style={styles.dosageTextWrapper}>
              <Text style={styles.dosageLabel}>RECOMMENDED DOSAGE</Text>
              <Text style={styles.dosageValue}>{highlightBox}</Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: dimensions.cardRadius,
    borderWidth: 2,
    borderColor: colors.slate300,
    borderLeftWidth: 6,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1.5,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: colors.slate300,
  },
  title: {
    fontSize: typography.bodyLarge,
    fontWeight: typography.weightBold,
    color: colors.slate950,
    flex: 1,
  },
  body: {
    padding: 16,
  },
  contentText: {
    fontSize: typography.bodyLarge,
    lineHeight: 24,
    color: colors.slate800,
    fontWeight: typography.weightMedium,
  },
  dosageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  dosageIcon: {
    marginRight: 10,
  },
  dosageTextWrapper: {
    flex: 1,
  },
  dosageLabel: {
    fontSize: 11,
    fontWeight: typography.weightBold,
    color: '#92400E',
    letterSpacing: 0.8,
  },
  dosageValue: {
    fontSize: typography.bodyLarge,
    fontWeight: typography.weightBold,
    color: colors.slate950,
    marginTop: 2,
  },
});

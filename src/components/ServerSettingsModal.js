import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, dimensions } from '../utils/theme';
import {
  getStoredServerUrl,
  saveStoredServerUrl,
  testServerConnection,
  DEFAULT_TUNNEL_URL,
  DEFAULT_LAN_URL,
} from '../utils/modelInference';

export default function ServerSettingsModal({ visible, onClose, onServerChanged }) {
  const [urlInput, setUrlInput] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { ok: boolean, message: string }

  useEffect(() => {
    if (visible) {
      setTestResult(null);
      getStoredServerUrl().then((stored) => {
        setUrlInput(stored || DEFAULT_TUNNEL_URL);
      });
    }
  }, [visible]);

  const handleTestConnection = async (targetUrl = null) => {
    const toTest = targetUrl || urlInput;
    if (!toTest) {
      setTestResult({ ok: false, message: 'Please enter a server URL' });
      return;
    }
    setTesting(true);
    setTestResult(null);

    const res = await testServerConnection(toTest);
    setTesting(false);

    if (res.ok) {
      const device = res.data?.device || 'CPU';
      const model = res.data?.app || 'AgroNex AI';
      setTestResult({
        ok: true,
        message: `Connected! ${model} (${device.toUpperCase()})`,
      });
    } else {
      setTestResult({
        ok: false,
        message: `Failed: ${res.error || 'Server not reachable'}`,
      });
    }
  };

  const handleSave = async () => {
    if (!urlInput.trim()) {
      Alert.alert('Invalid URL', 'Please enter a valid server URL');
      return;
    }
    await saveStoredServerUrl(urlInput.trim());
    if (onServerChanged) {
      onServerChanged(urlInput.trim());
    }
    Alert.alert('Server Saved', `AgroNex will now connect to:\n${urlInput.trim()}`, [
      { text: 'OK', onPress: onClose },
    ]);
  };

  const handleUsePreset = (presetUrl) => {
    setUrlInput(presetUrl);
    handleTestConnection(presetUrl);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="server-network" size={24} color="#34D399" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.title}>AI Server Settings</Text>
              <Text style={styles.subtitle}>Configure inference backend URL</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Input Label */}
          <Text style={styles.inputLabel}>Server Endpoint URL:</Text>
          <TextInput
            style={styles.input}
            value={urlInput}
            onChangeText={(text) => {
              setUrlInput(text);
              setTestResult(null);
            }}
            placeholder="https://... or http://172.17.x.x:5001"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Quick Presets */}
          <Text style={styles.presetsLabel}>Quick Switch Presets:</Text>
          <View style={styles.presetsRow}>
            <TouchableOpacity
              style={[styles.presetBtn, urlInput === DEFAULT_TUNNEL_URL && styles.presetBtnActive]}
              onPress={() => handleUsePreset(DEFAULT_TUNNEL_URL)}
            >
              <MaterialCommunityIcons name="cloud-check" size={16} color="#059669" />
              <Text style={styles.presetText}>Cloud Tunnel (HTTPS)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.presetBtn, urlInput === DEFAULT_LAN_URL && styles.presetBtnActive]}
              onPress={() => handleUsePreset(DEFAULT_LAN_URL)}
            >
              <MaterialCommunityIcons name="wifi" size={16} color="#2563EB" />
              <Text style={styles.presetText}>Local Wi-Fi IP</Text>
            </TouchableOpacity>
          </View>

          {/* Test Status Feedback */}
          {testing && (
            <View style={styles.statusBox}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.statusTextTesting}>Pinging server...</Text>
            </View>
          )}

          {testResult && (
            <View
              style={[
                styles.statusBox,
                testResult.ok ? styles.statusBoxSuccess : styles.statusBoxError,
              ]}
            >
              <MaterialCommunityIcons
                name={testResult.ok ? 'check-circle' : 'alert-circle'}
                size={18}
                color={testResult.ok ? '#059669' : '#DC2626'}
              />
              <Text
                style={[
                  styles.statusText,
                  testResult.ok ? styles.statusTextSuccess : styles.statusTextError,
                ]}
              >
                {testResult.message}
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.testBtn}
              onPress={() => handleTestConnection()}
              disabled={testing}
            >
              <MaterialCommunityIcons name="swap-vertical" size={18} color={colors.primaryDark} />
              <Text style={styles.testBtnText}>Test URL</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <MaterialCommunityIcons name="content-save-check" size={18} color={colors.white} />
              <Text style={styles.saveBtnText}>Save & Use</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryDarkest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: typography.bold,
    color: colors.primaryDarkest,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  closeBtn: {
    padding: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: typography.bold,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    fontFamily: typography.regular,
  },
  presetsLabel: {
    fontSize: 12,
    fontFamily: typography.bold,
    color: colors.textSecondary,
    marginTop: 12,
    marginBottom: 6,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  presetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  presetBtnActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  presetText: {
    fontSize: 11,
    fontFamily: typography.bold,
    marginLeft: 4,
    color: colors.textPrimary,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginBottom: 14,
  },
  statusBoxSuccess: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusBoxError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statusTextTesting: {
    marginLeft: 8,
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: typography.regular,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 12,
    fontFamily: typography.bold,
    flex: 1,
  },
  statusTextSuccess: {
    color: '#065F46',
  },
  statusTextError: {
    color: '#991B1B',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  testBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    minHeight: dimensions.minTouchTarget,
  },
  testBtnText: {
    fontSize: 14,
    fontFamily: typography.bold,
    color: colors.primaryDarkest,
    marginLeft: 6,
  },
  saveBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.primary,
    minHeight: dimensions.minTouchTarget,
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: typography.bold,
    color: colors.white,
    marginLeft: 6,
  },
});

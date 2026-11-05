const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('onnx', 'wasm', 'asset', 'bin');

module.exports = config;

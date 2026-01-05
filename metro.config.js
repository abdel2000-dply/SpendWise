const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Speed up bundling
config.transformer.minifierPath = "metro-minify-terser";
config.transformer.minifierConfig = {
  compress: {
    drop_console: false,
  },
};

// Increase worker count for parallel processing
config.maxWorkers = 4;

// Cache settings
config.resetCache = false;

module.exports = config;

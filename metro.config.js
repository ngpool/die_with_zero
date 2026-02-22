const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Allow Metro to resolve .sql files used by Drizzle migrations
// The actual content is inlined via babel-plugin-inline-import
config.resolver.sourceExts = [...config.resolver.sourceExts, "sql"];

module.exports = withNativeWind(config, { input: "./global.css" });

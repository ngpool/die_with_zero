const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push("wasm");

// Allow Metro to resolve .sql files used by Drizzle migrations
config.resolver.sourceExts = [...config.resolver.sourceExts, "sql"];

// Inject security headers to enable SharedArrayBuffer on web
config.server = {
    ...config.server,
    enhanceMiddleware: (middleware) => {
        return (req, res, next) => {
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
            return middleware(req, res, next);
        };
    },
};

module.exports = withNativeWind(config, { input: "./global.css" });

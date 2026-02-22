/**
 * Custom Metro transformer for .sql files.
 * Wraps SQL content as a JS string export so Drizzle migrations can import them.
 */
const upstreamTransformer = require("@expo/metro-config/babel-transformer");

module.exports.transform = async ({ src, filename, options }) => {
    if (filename.endsWith(".sql")) {
        const sqlString = JSON.stringify(src);
        return upstreamTransformer.transform({
            src: `module.exports = ${sqlString};`,
            filename,
            options,
        });
    }
    return upstreamTransformer.transform({ src, filename, options });
};

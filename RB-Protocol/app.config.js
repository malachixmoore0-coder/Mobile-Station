// Dynamic Expo config. Reads the static app.json and lets the web base path be
// overridden at build time via EXPO_BASE_URL. The GitHub Pages workflow sets
// this to the real repository name (with exact casing) so assets resolve at
// https://<owner>.github.io/<repo>/. Locally it falls back to the app.json value.
module.exports = ({ config }) => {
  const baseUrl = process.env.EXPO_BASE_URL ?? config.experiments?.baseUrl ?? '/';
  return {
    ...config,
    experiments: {
      ...config.experiments,
      baseUrl,
    },
  };
};

// Dynamic Expo config. Reads the static app.json and lets the web base path be
// overridden at build time via EXPO_BASE_URL so GitHub Pages deploys resolve
// assets at https://<owner>.github.io/<repo>/compound-forge/.
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

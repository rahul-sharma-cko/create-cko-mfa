const { ModuleFederationPlugin } = require('webpack').container;
const { dependencies } = require('./package.json');

// The `name` field below is auto-filled from your project name at generation time.
// Update the `exposes` object to match your actual remote components.
const moduleFederationConfig = (assetPathPrefix = '') =>
  new ModuleFederationPlugin({
    name: 'dashboard_MFE_NAME',
    filename: `${assetPathPrefix}remoteEntry.js`,
    exposes: {
      './AppRoutes': './src/remotes/AppRoutes',
    },
    shared: {
      react: { singleton: true, requiredVersion: dependencies.react },
      'react-dom': { singleton: true, requiredVersion: dependencies['react-dom'] },
      'react-router-dom': {
        singleton: true,
        requiredVersion: dependencies['react-router-dom'],
      },
      '@tanstack/react-query': {
        singleton: true,
        requiredVersion: dependencies['@tanstack/react-query'],
      },
      '@cko/dashboard-shared': {
        singleton: true,
        requiredVersion: dependencies['@cko/dashboard-shared'],
      },
      'styled-components': {
        singleton: true,
        requiredVersion: dependencies['styled-components'],
      },
      '@okta/okta-react': {
        singleton: true,
        requiredVersion: dependencies['@okta/okta-react'],
      },
      '@cko/icons': {
        singleton: false,
        requiredVersion: '^10.2.0',
      },
      '@cko/patterns': {
        singleton: false,
        requiredVersion: '^10.2.0',
      },
      '@cko/primitives': {
        singleton: false,
        requiredVersion: '^10.2.0',
      },
      '@cko/utils': {
        singleton: false,
        requiredVersion: '^9.23.2',
      },
    },
  });

module.exports = moduleFederationConfig;

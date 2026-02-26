# Dashboard Micro Frontend (MFE) Boilerplate

Welcome to the MFE setup guide!

This boilerplate scaffolds a Webpack Module Federation micro frontend that integrates with the
Checkout dashboard ecosystem. It exposes React components via `remoteEntry.js` for consumption by
the dashboard shell app.

---

## Getting Started

```bash
yarn       # install dependencies
yarn dev   # start the dev server on http://localhost:3050
```

---

## Configuring your new MFE

### 1. Name your MFE

The project name and module federation name are derived from the name you provided to `create-cko-mfa`
and are pre-populated in `package.json` (`mfe.name`, `mfe.path`) and `moduleFederationConfig.js`.

Verify the generated names follow the convention:

`dashboard[-/_]{TEAM_NAME/PRODUCT_AREA}[-/_]{FEATURE_NAME}`

For example:

```json
// package.json
{
  "name": "my-feature",
  "mfe": {
    "name": "dashboard_my_feature-mfe",
    "path": "dashboard-my-feature"
  }
}
```

```javascript
// moduleFederationConfig.js
new ModuleFederationPlugin({
  name: 'dashboard_my_feature',
  ...
})
```

### 2. Choose which components to expose

In `moduleFederationConfig.js`, update the `exposes` object with the components your MFE makes
available to the shell app:

```javascript
exposes: {
  './AppRoutes':     './src/remotes/AppRoutes',     // main routes component
  './LinkWrapper':   './src/remotes/LinkWrapper',   // optional nav link component
},
```

Place your remote components under `src/remotes/` and re-export them from `src/index.ts`.

### 3. Configure environment variables

Copy `.envExample` to `.env` and fill in the correct values for your environment:

```
BASE_URL=http://localhost:3050
APP_API_BASE_URL=https://your-api-qa.ckotech.co
```

Runtime config injected by the shell app is read from `window.__compass_config` in
`src/app-settings.ts`. Update this file if you need additional runtime values.

### 4. Configure the dev server proxy

In `webpack.dev.js`, update the proxy `target` to point at your backend API:

```javascript
proxy: [
  {
    context: ['/'],
    target: 'https://your-api-qa.ckotech.co/api',
    changeOrigin: true,
    secure: false,
  },
],
```

### 5. Set the dev server port

The default dev port is **3050**. Change it in `webpack.dev.js` if already in use:

```javascript
devServer: {
  port: 3050, // update to an available port
}
```

See the [MFE local development ports](https://checkout.atlassian.net/wiki/spaces/HUBV/pages/5904957723/MFE+local+development+ports)
page for a list of ports in use.

---

## Integrating with the dashboard shell app

After your MFE is running, configure the [dashboard shell app](https://github.com/cko-hub-vnext/web-ui):

1. Add an environment variable pointing to your MFE's `remoteEntry.js`:

   ```
   WEBUI_MF_<APPNAME>_ENTRY_POINT=http://localhost:<PORT>/remoteEntry.js
   ```

2. Dynamically import your exposed component wherever it needs to be rendered:

   ```javascript
   const AppRoutes = React.lazy(loadComponent('dashboard_my_feature', './AppRoutes'));
   ```

---

## Available scripts

| Script              | Description                                 |
| ------------------- | ------------------------------------------- |
| `yarn dev`          | Start webpack-dev-server on port 3050        |
| `yarn build`        | Production build (with versioned asset path) |
| `yarn test`         | Run Jest in watch mode                      |
| `yarn test:ci`      | Run Jest with coverage (CI mode)            |
| `yarn lint`         | Run ESLint                                  |
| `yarn typecheck`    | Run TypeScript type checker                 |
| `yarn format`       | Format source files with Prettier           |

---

## Project structure

```
src/
├── remotes/          # Module Federation exposed components
│   ├── AppRoutes.tsx # Main routes — update to expose your pages
│   └── index.ts
├── app/              # Example page component
│   ├── App.tsx
│   └── App.test.tsx
├── app-settings.ts   # Runtime config (reads from window.__compass_config)
├── config.ts         # Environment variables
└── index.ts          # Re-exports from remotes/
```

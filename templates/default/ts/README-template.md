# Dashboard Micro Frontend (MFE) Boilerplate

Welcome to the MFE setup guide!

The goal of this is to help teams set up and configure a new micro frontend (MFE). This is essentially
a Node server that will expose a `remoteEntry.js` file. This file allows other MFEs to consume any exposed components via Webpack's Module Federation.

Please note that while the boilerplate setup includes React and Webpack, it **does not** include HTML
rendering, and thus you will have to import any exposed components in the dashboard core app for testing.

---

## Initial Setup

1. Create a new repo.

2. Copy over the contents of this boilerplate repository to the repo root.

---

## Configuring your new MFE

### Define the names

1. Within your `package.json`, choose a package name using the format:

   `dashboard[-/_]{TEAM_NAME/PRODUCT_AREA}[-/_]{FEATURE_NAME}`

   For example:

   ```json
   {
     "name": "@cko/dashboard-fts-reporting",
     ...
   }
   ```

2. Within your `webpack.config.js`, in the `ModuleFederationPlugin` configuration, modify `name`, using the following format:

   `dashboard[-/_]{TEAM_NAME/PRODUCT_AREA}[-/_]{FEATURE_NAME}`

   For example:

   ```javascript
   new ModuleFederationPlugin({
     name: 'dashboard_fts_reporting',
     ...
   })
   ```

   This name is important as it is the unique key that will identify your app when other MFEs are
   importing your exposed components.

### Choose remote components to expose

1.  Within your `webpack.config.js`, in the `ModuleFederationPlugin` configuration, add the components
    to `exposes` that you want to expose remotely to consumers of your MFE.

        The format of each component's key/value pair should be: `'./COMPONENT': './PATH/WITHIN/THIS/REPO'`

        For example:
        ```javascript
        new ModuleFederationPlugin({
          ...
          exposes: {
            './Navigation': './src/remotes/NavigationComponent',
          },
          ...
        })
        ```

2.  You may not have any components built during this stage, so it could be worth exposing the
    `App` component with a hello world message to test if your MFE is successfully imported to the
    dashboard shell app.

### Choose a server port

1. Navigate to `server/index.ts` and change the port to a number that has not already been taken. To
   see a list of ports in use, visit the
   [MFE local development ports](https://checkout.atlassian.net/wiki/spaces/HUBV/pages/5904957723/MFE+local+development+ports)
   page and add your chosen port to the list.

2. Currently for `livereload` to work, only one MFE making use of `livereload` can be started. If
   this is not done, an error will be thrown that the port is in use.

3. Currently `cors` is set up to \*; as such it is important to configure it.

---

## Configuring the dashboard shell app

After working in your MFE, shift to the [Web-UI repo](https://github.com/cko-hub-vnext/web-ui) and
carry out the following steps:

1.  Navigate to the [.env](https://github.com/cko-hub-vnext/web-ui/blob/master/packages/app/.env) file
    and under the Micro Frontends section, configure the environment variable for the new MFE app:

        ```
        WEBUI_MF_<APPNAME>_ENTRY_POINT=http://localhost:<PORT_NUMBER>/remoteEntry.js`
        ```

        The `<APPNAME>` needs to match the name used within the `ModuleFederationPlugin` **without** the
        `dashboard_` prefix.

2.  You are now ready to dynamically import any exposed MFE component code into the main application
    wherever it needs to be used.

        For example:

          ```javascript
          const Navigation = React.lazy(loadComponent('dashboard_fts_reporting', './Navigation'));
          ```

---

## Testing the integration with the dashboard shell app

To test if your MFE is successfully being imported into the shell app, we recommend the following:

1. Before building your entire app, create and expose a simple "hello world" component. This will give
   you confidence that the integration works from the start.
2. Don't forget to run `yarn` to install all boilerplate dependencies.
3. When ready to generate your `remoteEntry.js` client file (and not using `livereload`), run
   the `yarn build-client` command.
4. If testing locally, and you have set a localhost URL within the `.env` file in [Web-UI repo](https://github.com/cko-hub-vnext/web-ui), run
   `yarn dev`. This will spin-up your server, on the port you provided. Ignore this step if your MFE
   is already hosted on a live link (i.e. it's in QA).
5. Within Web-UI, run `yarn dev` in a separate terminal instance.
6. Visit `http://localhost:3000/` (Web-UI's localhost address) and check if your component is visible. At this point, both the dashboard shell app and your MFE will be running separately.
7. If you cannot see your component, check errors in DevTools. Remember to dynamically import your
   component!

---

## [OPTIONAL] Environment configuration

Should you need to add environment-specific configuration to your MFE, follow these steps.

### Within your MFE:

1.  Create a `.env` file and add any environment variables prefixed with `WEBUI_MF`.

2.  Navigate to `server/config-template.js` and configure your environment variables to be attached
    to the window:

        ```javascript
        window.__boilerplate_config = {
          WEBUI_MF_BOILERPLATE_API: '{{ env.WEBUI_MF_BOILERPLATE_API }}',
        };
        ```

### Within the dashboard shell app:

1. Navigate to the `.env` file and configure an environment variable for the config file:

   ```
   WEBUI_MF_<APPNAME>_CONFIG=http://localhost:<PORT_NUMBER>/config`
   ```

2. The `<APPNAME>` needs to match the name used within the ModuleFederationPlugin without the `dashboard_`

---

## [OPTIONAL] API Proxy Configuration

The boilerplate code ships with functionality that allow for an API that requires scope based
authentication to be proxied, with token verification, permissions validation, and token exchange
inbuilt.

Most backend services and APIs should not require such a token, however, if yours does, follow these
steps:

### Initial Configuration of the Access Issuer and API

1.  Configure the env variable `AccessIssuer__BaseAddress`. This is the URL that is issuing the
    tokens, and will be used to verify the token sent to the proxy is valid.
2.  Configure the end variable `AccessApi__BaseAddress`. This is the API exposed by the Access team
    to handle the delegated token exchange.
3.  Request a client ID and client secret from the Access team. These should be stored in some secrets
    manager and need to be exposed to the server at runtime, and hooked into the following util: `getAccessDelegationConfig`.

### Configure the Proxy Endpoint

1. Once the configuration is in place add an entry in `endpoints` configuration found at `router/endpoints.ts` using the following format:
   ```javascript
   {
     name: string; // A friendly name for the endpoint, useful for gathering metrics.
     path: string; // The proxy path (the URL which the client will call).
     method: EndpointMethod; // The proxy/target method.
     permission: string; // The permission within cko_permission to call the taget API.
     target: string; // The target API to call.
   }
   ```

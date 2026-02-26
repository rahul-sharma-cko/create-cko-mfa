# create-cko-mfa

CLI scaffolding tool for creating Checkout dashboard Micro Frontend Applications (MFEs).

Generates a project matching the patterns used by existing MFEs (e.g. `balances-on-dashboard-fe`) — with Webpack Module Federation, React 18, the full `@cko` design system, TypeScript 5, and no Express server.

---

## Usage

```sh
npx create-cko-mfa <project-name>
```

**Example:**

```sh
npx create-cko-mfa payments-mfe
```

This creates a new directory `payments-mfe/` with a fully configured MFE project.

---

## Options

| Flag                          | Description                                      |
| ----------------------------- | ------------------------------------------------ |
| `--ts`, `--typescript`        | TypeScript project (default)                     |
| `--js`, `--javascript`        | JavaScript project                               |
| `--import-alias <alias>`      | Custom import alias (default: `@/*`)             |
| `-e, --example [name\|url]`   | Bootstrap from a GitHub example repo             |
| `--example-path <path>`       | Subdirectory within the example repo             |
| `--reset-preferences`         | Clear stored CLI preferences                     |

---

## What gets generated

```
my-mfe/
├── src/
│   ├── remotes/            # Module Federation exposed components
│   │   ├── AppRoutes.tsx   # Main routes — customise with your pages
│   │   └── index.ts
│   ├── app/
│   │   ├── App.tsx         # Example page component
│   │   └── App.test.tsx
│   ├── app-settings.ts     # Runtime config (reads from window.__compass_config)
│   ├── config.ts           # Build-time environment variables
│   └── index.ts            # Re-exports from remotes/
│
├── webpack.common.js       # Shared webpack config
├── webpack.dev.js          # Dev server (port 3050, HMR, proxy)
├── webpack.prod.js         # Production build (compression, versioned assets)
├── moduleFederationConfig.js  # Module Federation plugin config
├── sourcemapsConfig.js
│
├── tsconfig.json           # TypeScript config
├── tsconfig.base.json
├── tsconfig.eslint.json
├── jest.config.js
├── jestGlobalSetup.js
├── babel.config.js
├── .eslintrc.js
├── .prettierrc
├── Dockerfile
├── .env
├── .envExample
└── package.json
```

---

## Generated project: key details

### Dependencies included

| Category          | Packages                                                                   |
| ----------------- | -------------------------------------------------------------------------- |
| React             | `react` 18.3.1, `react-dom`, `react-router-dom` v5                        |
| Data fetching     | `@tanstack/react-query` 4.35.3                                             |
| Auth              | `@okta/okta-react` 6.9.0                                                   |
| Design system     | `@cko/primitives`, `@cko/patterns`, `@cko/icons`, `@cko/utils` `^10.x`    |
|                   | `@cko/dashboard-shared` 1.90.0, `@cko/calendar`, `@cko/data-visualisation` |
| Styling           | `styled-components` 6.1.13, `styled-system`, `polished`                   |
| Utilities         | `date-fns` 4.1.0, `date-fns-tz`, `react-error-boundary`                  |
| Build             | `webpack` 5.96.1, `webpack-dev-server` 5.1.0, `typescript` 5.7.2          |
| Testing           | `jest` 29.7.0, `@testing-library/react` 14.0.0                            |

### Scripts

| Script              | Description                                    |
| ------------------- | ---------------------------------------------- |
| `yarn dev`          | Start dev server on `http://localhost:3050`    |
| `yarn build`        | Production build (versioned asset paths)       |
| `yarn test`         | Run Jest in watch mode                         |
| `yarn test:ci`      | Run Jest with coverage (CI)                    |
| `yarn lint`         | ESLint                                         |
| `yarn typecheck`    | TypeScript type check                          |
| `yarn format`       | Prettier                                       |

---

## After scaffolding

See `README.md` inside the generated project for step-by-step instructions on:

- Renaming the Module Federation `name` and `exposes`
- Configuring the dev server proxy to your backend API
- Setting up environment variables
- Integrating with the dashboard shell app

---

## Publishing a new version

```sh
# Build the CLI
yarn release

# Publish to npm
npm publish
```

The CLI is bundled with `@vercel/ncc` into a single `dist/index.js` file.

---

## Local development of the CLI

### 1. Install CLI dependencies

```sh
cd /path/to/create-cko-mfa
yarn install
```

### 2. Build the CLI

**One-shot build** (recommended for testing):

```sh
./node_modules/.bin/ncc build ./index.ts -o ./dist/ --no-source-map-register
```

**Watch mode** (rebuilds on every file save):

```sh
yarn dev
```

> Note: the `yarn release` script assumes a monorepo `scripts/rm.mjs`. Use the `ncc` command above when working standalone.

### 3. Scaffold a test MFE

```sh
node ./dist/index.js /tmp/my-test-mfe
```

Or scaffold into the current directory with a relative path:

```sh
node /path/to/create-cko-mfa/dist/index.js my-test-mfe
```

This creates `my-test-mfe/`, installs all dependencies, and initialises a git repo.

### 4. Verify the generated project

Check that the MFE name was correctly wired up:

```sh
# Should show `name: 'dashboard_my_test_mfe'`
grep "name:" my-test-mfe/moduleFederationConfig.js

# Should show mfe.path: "dashboard-my-test-mfe"
cat my-test-mfe/package.json
```

Check the generated file tree (excluding node_modules):

```sh
find my-test-mfe -not -path "*/node_modules/*" -type f | sort
```

### 5. (Optional) Install globally via npm link

To use `create-cko-mfa my-app` from anywhere on your machine:

```sh
# In the create-cko-mfa repo root:
./node_modules/.bin/ncc build ./index.ts -o ./dist/ --no-source-map-register
npm link

# Now from any directory:
create-cko-mfa my-feature-mfe
```

To unlink when done:

```sh
npm unlink -g create-cko-mfa
```

### Iterating on templates

Template files live in `templates/default/ts/`. After editing:

1. Rebuild: `./node_modules/.bin/ncc build ./index.ts -o ./dist/ --no-source-map-register`
2. Delete any previous test scaffold: `rm -rf /tmp/my-test-mfe`
3. Re-scaffold: `node ./dist/index.js /tmp/my-test-mfe`
4. Inspect the output in `/tmp/my-test-mfe/`

Package.json generation (dependencies, scripts) is in `templates/index.ts` — edit that file to change what the generated project contains.

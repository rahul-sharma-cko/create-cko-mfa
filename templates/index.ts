import { install } from '../helpers/install';
import { makeDir } from '../helpers/make-dir';
import { copy } from '../helpers/copy';

import { async as glob } from 'fast-glob';
import os from 'os';
import fs from 'fs/promises';
import path from 'path';
import { cyan, bold } from 'picocolors';
import { Sema } from 'async-sema';
import pkg from '../package.json';

import { GetTemplateFileArgs, InstallTemplateArgs } from './types';

/**
 * Get the file path for a given file in a template, e.g. "webpack.config.js".
 */
export const getTemplateFile = ({ template, mode, file }: GetTemplateFileArgs): string => {
  return path.join(__dirname, template, mode, file);
};

export const SRC_DIR_NAMES = ['src'];

/**
 * Install a CKO MFE template to a given `root` directory.
 */
export const installTemplate = async ({
  appName,
  root,
  isOnline,
  template,
  mode,
  eslint,
  srcDir,
  importAlias,
}: InstallTemplateArgs) => {
  console.log(bold('Using yarn.'));

  /**
   * Copy the template files to the target directory.
   */
  console.log('\nInitializing project with template:', template, '\n');
  const templatePath = path.join(__dirname, template, mode);
  const copySource = ['**'];

  await copy(copySource, root, {
    parents: true,
    cwd: templatePath,
    rename(name) {
      switch (name) {
        case 'browserslistrc':
        case 'env':
        case 'envExample':
        case 'eslintignore':
        case 'eslintrc.js':
        case 'npmrc':
        case 'gitignore':
        case 'nvmrc':
        case 'prettierignore':
        case 'prettierrc': {
          return `.${name}`;
        }
        // README-template.md is ignored by webpack-asset-relocator-loader used by ncc:
        // https://github.com/vercel/webpack-asset-relocator-loader/blob/e9308683d47ff507253e37c9bcbb99474603192b/src/asset-relocator.js#L227
        case 'README-template.md': {
          return 'README.md';
        }
        default: {
          return name;
        }
      }
    },
  });

  const tsconfigFile = path.join(root, 'tsconfig.json');
  await fs.writeFile(
    tsconfigFile,
    (await fs.readFile(tsconfigFile, 'utf8'))
      .replace(`"@/*": ["./*"]`, srcDir ? `"@/*": ["./src/*"]` : `"@/*": ["./*"]`)
      .replace(`"@/*":`, `"${importAlias}":`),
  );

  // update import alias in any files if not using the default
  if (importAlias !== '@/*') {
    const files = await glob('**/*', {
      cwd: root,
      dot: true,
      stats: false,
    });
    const writeSema = new Sema(8, { capacity: files.length });
    await Promise.all(
      files.map(async (file) => {
        // We don't want to modify compiler options in [ts/js]config.json
        if (file === 'tsconfig.json' || file === 'jsconfig.json') return;
        await writeSema.acquire();
        const filePath = path.join(root, file);
        if ((await fs.stat(filePath)).isFile()) {
          await fs.writeFile(
            filePath,
            (await fs.readFile(filePath, 'utf8')).replace(
              `@/`,
              `${importAlias.replace(/\*/g, '')}`,
            ),
          );
        }
        await writeSema.release();
      }),
    );
  }

  // Replace the MFE_NAME placeholder in moduleFederationConfig.js with the
  // snake_case version of the app name.
  const mfeName = appName.replace(/-/g, '_');
  const mfeConfigPath = path.join(root, 'moduleFederationConfig.js');
  await fs.writeFile(
    mfeConfigPath,
    (await fs.readFile(mfeConfigPath, 'utf8')).replace(/MFE_NAME/g, mfeName),
  );

  /** Create a package.json for the new project and write it to disk. */
  const packageJson: any = {
    name: appName,
    version: '0.1.0',
    private: true,
    mfe: {
      name: `dashboard_${mfeName}-mfe`,
      path: `dashboard-${appName}`,
    },
    scripts: {
      dev: 'webpack serve --config webpack.dev.js',
      build: 'webpack --config webpack.prod.js',
      'build:release': 'webpack --env production',
      test: 'jest --watch',
      'test:ci': 'jest --bail --silent --no-watchman --colors --coverage',
      'test:once': 'jest --no-watch',
      lint: 'eslint . --cache --quiet --ext .js,.ts,.tsx,.json',
      'lint:ci': 'yarn lint',
      'ci:local': 'yarn lint && yarn build',
      format: "prettier --write 'src/**/*.ts{,x}'",
      typecheck: 'tsc --noEmit --pretty',
      prepare: 'husky',
      'pre-commit': 'lint-staged',
      'pre-push': 'lint-prepush',
    },
    'lint-staged': {
      'src/**/*.{js,ts,tsx,json}': 'prettier --write',
    },
    'lint-prepush': {
      verbose: false,
      tasks: {
        'src/**/*.{js,ts,tsx,json}': {
          concurrent: [
            'yarn eslint --cache --quiet --ext .js,.ts,.tsx,.json',
            'bash -c tsc',
            'yarn jest --bail --no-watchman --colors --silent --findRelatedTests',
          ],
        },
      },
    },
    /**
     * Runtime dependencies — included in Module Federation shared config.
     */
    dependencies: {
      '@cko/calendar': '^10.2.0',
      '@cko/dashboard-shared': '1.90.0',
      '@cko/data-visualisation': '1.3.4',
      '@cko/icons': '^10.2.0',
      '@cko/patterns': '^10.2.0',
      '@cko/primitives': '^10.2.0',
      '@cko/utils': '^9.23.2',
      '@okta/okta-react': '6.9.0',
      '@tanstack/react-query': '4.35.3',
      'date-fns': '4.1.0',
      'date-fns-tz': '^3.2.0',
      polished: '4.3.1',
      react: '18.3.1',
      'react-dom': '18.3.1',
      'react-error-boundary': '^4.0.11',
      'react-router-dom': '^5.3.3',
      'styled-components': '6.1.13',
      'styled-system': '5.1.5',
    },
    /**
     * Build and dev tooling — not bundled into the MFE output.
     */
    devDependencies: {
      '@babel/core': '7.26.0',
      '@babel/plugin-proposal-class-properties': '^7.18.6',
      '@babel/plugin-syntax-dynamic-import': '^7.8.3',
      '@babel/preset-env': '^7.26.0',
      '@babel/preset-react': '^7.25.9',
      '@babel/preset-typescript': '^7.26.0',
      '@pmmmwh/react-refresh-webpack-plugin': '^0.5.15',
      '@testing-library/jest-dom': '^6.6.3',
      '@testing-library/react': '^14.0.0',
      '@testing-library/user-event': '^14.5.2',
      '@types/jest': '^29.2.5',
      '@types/node': '^18.11.18',
      '@types/react': '^18.3.1',
      '@types/react-dom': '^18.3.0',
      '@types/react-router-dom': '^5.3.3',
      '@typescript-eslint/eslint-plugin': '^5.56.0',
      '@typescript-eslint/parser': '^5.56.0',
      'babel-loader': '^9.1.2',
      'babel-plugin-inline-react-svg': '^2.0.1',
      'babel-plugin-styled-components': '^2.0.7',
      'case-sensitive-paths-webpack-plugin': '^2.4.0',
      'clean-webpack-plugin': '^4.0.0',
      'compression-webpack-plugin': '11.1.0',
      'core-js': '^3.27.1',
      'css-loader': '^6.7.3',
      'css-minimizer-webpack-plugin': '7.0.0',
      eslint: '^8.50.0',
      'eslint-config-airbnb': '^19.0.4',
      'eslint-config-airbnb-typescript': '^17.0.0',
      'eslint-config-prettier': '^9.0.0',
      'eslint-config-react-app': '^7.0.1',
      'eslint-plugin-flowtype': '^8.0.3',
      'eslint-plugin-import': '^2.27.5',
      'eslint-plugin-jest': '^27.2.1',
      'eslint-plugin-jest-dom': '^5.0.1',
      'eslint-plugin-json': '^3.1.0',
      'eslint-plugin-jsx-a11y': '^6.7.1',
      'eslint-plugin-prettier': '^5.0.0',
      'eslint-plugin-react': '^7.32.2',
      'eslint-plugin-react-hooks': '^4.6.0',
      'eslint-plugin-testing-library': '^6.0.0',
      husky: '^9.1.7',
      jest: '^29.7.0',
      'jest-date-mock': '^1.0.8',
      'jest-environment-jsdom': '^29.7.0',
      'jest-localstorage-mock': '^2.4.26',
      'jest-styled-components': '^7.2.0',
      'lint-prepush': '3.0.2',
      'lint-staged': '^15.2.10',
      'postcss-safe-parser': '^6.0.0',
      prettier: '^3.3.3',
      'react-refresh': '^0.14.0',
      'style-loader': '^3.3.3',
      'terser-webpack-plugin': '^5.3.10',
      typescript: '5.7.2',
      'url-loader': '^4.1.1',
      webpack: '5.96.1',
      'webpack-cli': '^5.1.4',
      'webpack-dev-server': '5.1.0',
      'webpack-merge': '^5.10.0',
    },
  };

  /**
   * TypeScript projects will have type definitions and other devDependencies.
   */
  if (mode === 'ts') {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
    };
  }

  const devDeps = Object.keys(packageJson.devDependencies).length;
  if (!devDeps) delete packageJson.devDependencies;

  await fs.writeFile(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2) + os.EOL,
  );

  console.log('\nInstalling dependencies:');
  for (const dependency in packageJson.dependencies) console.log(`- ${cyan(dependency)}`);

  if (devDeps) {
    console.log('\nInstalling devDependencies:');
    for (const dependency in packageJson.devDependencies) console.log(`- ${cyan(dependency)}`);
  }

  console.log();

  await install(isOnline);
};

export * from './types';

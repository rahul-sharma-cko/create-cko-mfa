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
 * Get the file path for a given file in a template, e.g. "next.config.js".
 */
export const getTemplateFile = ({ template, mode, file }: GetTemplateFileArgs): string => {
  return path.join(__dirname, template, mode, file);
};

export const SRC_DIR_NAMES = ['server', 'src'];

/**
 * Install a Next.js internal template to a given `root` directory.
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
      console.log('the name is: ', name);
      switch (name) {
        case 'browserslistrc':
        case 'env':
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

  const tsconfigFile = path.join(root, mode === 'js' ? 'tsconfig.json' : 'tsconfig.json');
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

  if (srcDir) {
    await makeDir(path.join(root, 'src'));
    await Promise.all(
      SRC_DIR_NAMES.map(async (file) => {
        await fs.rename(path.join(root, file), path.join(root, 'src', file)).catch((err) => {
          if (err.code !== 'ENOENT') {
            throw err;
          }
        });
      }),
    );

    const isAppTemplate = template.startsWith('app');

    // Change the `Get started by editing pages/index` / `app/page` to include `src`
    const indexPageFile = path.join(
      'src',
      isAppTemplate ? 'app' : 'pages',
      `${isAppTemplate ? 'page' : 'index'}.${mode === 'ts' ? 'tsx' : 'js'}`,
    );

    await fs.writeFile(
      indexPageFile,
      (await fs.readFile(indexPageFile, 'utf8')).replace(
        isAppTemplate ? 'app/page' : 'pages/index',
        isAppTemplate ? 'src/app/page' : 'src/pages/index',
      ),
    );
  }

  /** Create a package.json for the new project and write it to disk. */
  const packageJson: any = {
    name: appName,
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'yarn build-server && yarn start',
      'e2e:ci': 'yarn build-server && yarn start',
      build: 'yarn build-client:release && yarn build-server',
      'build-client': 'webpack',
      'build-client:release': 'webpack --env production',
      'clean:server': 'rimraf dist/server && rimraf dist/webpack.config.js',
      'build-server': 'yarn clean:server && yarn tsc -p tsconfig.server.json ',
      start: 'node dist/server',
      test: 'jest --watch',
      'test:ci': 'yarn jest --bail --silent --no-watchman --colors --config=jest.config.js',
      'test:once': 'jest --no-watch',
      lint: 'eslint . --cache --quiet --ext .js,.ts,.tsx,.json',
      'lint:ci': 'yarn lint',
      'ci:local': 'yarn lint && yarn build',
      format: 'prettier --write src/**/*.ts{,x}',
      typecheck: 'tsc --noEmit --pretty',
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
            'yarn jest --bail --no-watchman --colors --silent --config=jest.config.js --findRelatedTests',
          ],
        },
      },
    },
    /**
     * Default dependencies.
     */
    dependencies: {
      '@okta/jwt-verifier': '3.0.1',
      axios: '1.4.0',
      cors: '^2.8.5',
      dotenv: '^16.3.1',
      express: '^4.18.2',
      'express-static-gzip': '^2.1.7',
      handlebars: '^4.7.7',
      'http-proxy': '^1.18.1',
      winston: '^3.10.0',
    },
    devDependencies: {
      '@babel/core': '^7.22.10',
      '@babel/plugin-proposal-class-properties': '^7.18.6',
      '@babel/plugin-syntax-dynamic-import': '^7.8.3',
      '@babel/preset-env': '^7.22.10',
      '@babel/preset-react': '^7.22.5',
      '@babel/preset-typescript': '^7.22.5',
      '@cko/dashboard-shared': '1.48.2',
      '@cko/icons': '8.7.7',
      '@cko/papyrus': '8.7.7',
      '@cko/primitives': '8.7.7',
      '@cko/utils': '8.7.7',
      '@okta/okta-react': '^6.7.0',
      '@pmmmwh/react-refresh-webpack-plugin': '^0.5.10',
      '@popperjs/core': '^2.11.6',
      '@testing-library/jest-dom': '^6.0.0',
      '@testing-library/react': '^14.0.0',
      '@types/cors': '^2.8.13',
      '@types/express': '^4.17.15',
      '@types/http-proxy': '^1.17.9',
      '@types/jest': '^29.2.5',
      '@types/node': '^18.11.18',
      '@types/node-fetch': '^2.5.11',
      '@types/react': '18.0.26',
      '@types/react-dom': '^18.0.10',
      '@types/react-router-dom': '^5.3.3',
      '@types/styled-components': '^5.1.26',
      '@types/styled-system': '^5.1.16',
      '@types/testing-library__jest-dom': '^5.14.9',
      '@types/webpack-dev-middleware': '^5.0.2',
      '@typescript-eslint/eslint-plugin': '^5.56.0',
      '@typescript-eslint/parser': '^5.56.0',
      'babel-loader': '^9.1.2',
      'babel-plugin-inline-react-svg': '^2.0.1',
      'babel-plugin-styled-components': '^2.0.7',
      'case-sensitive-paths-webpack-plugin': '^2.4.0',
      'clean-webpack-plugin': '^4.0.0',
      'compression-webpack-plugin': '^10.0.0',
      'core-js': '^3.27.1',
      'css-loader': '^6.7.3',
      'css-minimizer-webpack-plugin': '^3.4.1',
      'date-fns': '^2.29.3',
      downshift: '^8.1.0',
      eslint: '^8.36.0',
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
      'focus-visible': '^5.2.0',
      'fork-ts-checker-webpack-plugin': '8.0.0',
      jest: '^29.3.1',
      'jest-date-mock': '^1.0.8',
      'jest-get-type': '^29.2.0',
      'jest-localstorage-mock': '^2.4.26',
      'jest-styled-components': '^7.1.1',
      'lint-prepush': '^2.1.0',
      'lint-staged': '^14.0.0',
      livereload: '^0.9.3',
      'node-fetch': '^2.6.1',
      'node-polyfill-webpack-plugin': '^2.0.1',
      polished: '^4.2.2',
      'postcss-safe-parser': '^6.0.0',
      prettier: '^3.0.0',
      'query-string': '^7.0.1',
      react: '18.2.0',
      'react-dom': '^18.2.0',
      'react-dropzone': '^14.2.3',
      'react-error-boundary': '^4.0.11',
      'react-focus-lock': '^2.9.2',
      'react-is': '^17.0.2',
      'react-popper': '^2.3.0',
      'react-query': '^3.39.3',
      'react-refresh': '^0.14.0',
      'react-router-dom': '^5.3.3',
      rimraf: '^5.0.1',
      'style-loader': '^3.3.3',
      'styled-components': '^5.3.11',
      'styled-system': '^5.1.5',
      'terser-webpack-plugin': '^5.3.9',
      typescript: '^4.9.5',
      'url-loader': '^4.1.1',
      uuid: '^8.0.0',
      webpack: '5.88.2',
      'webpack-cli': '5.1.4',
      'webpack-dev-middleware': '6.1.1',
      'webpack-hot-middleware': '2.25.4',
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

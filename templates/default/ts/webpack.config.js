const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const { devDependencies } = require('./package.json');

const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
const cpuCount = process.env.CPU_COUNT && parseInt(process.env.CPU_COUNT, 10);

module.exports = (env = { production: false }) => {
  const { production } = env;

  return {
    mode: production ? 'production' : 'development',
    devtool: !production ? 'eval-cheap-module-source-map' : false,
    entry: {
      main: [!production && 'webpack-hot-middleware/client', './src/index.ts'].filter(Boolean),
    },
    output: {
      clean: true,
      crossOriginLoading: production ? false : 'anonymous',
      filename: production ? '[name].[chunkhash].js' : '[name].js',
      path: path.resolve(__dirname, './dist/client'),
      publicPath: 'auto',
    },
    optimization: {
      minimize: production,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            keep_classnames: false,
            keep_fnames: false,
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
            sourceMap: shouldUseSourceMap,
          },
          // Use multi-process parallel running to improve the build speed
          // Default number of concurrent runs: os.cpus().length - 1
          parallel: cpuCount || true,
        }),
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: ['default', { minifyFontValues: { removeQuotes: false } }],
            processorOptions: {
              parser: safePostCssParser,
              map: shouldUseSourceMap
                ? {
                    inline: false,
                    annotation: true,
                  }
                : false,
            },
          },
        }),
      ],
    },
    plugins: [
      !production && new webpack.HotModuleReplacementPlugin(),
      !production && new ReactRefreshWebpackPlugin(),
      // Speeds up TypeScript type checking and ESLint linting by moving each to a separate process.
      !production && new ForkTsCheckerWebpackPlugin({ async: true }),
      new CaseSensitivePathsPlugin(),
      production &&
        new CompressionPlugin({
          filename: '[path][base].gz',
          algorithm: 'gzip',
          test: /\.js$|\.css$|\.html$/,
          threshold: 10240,
          minRatio: 0.8,
        }),
      production &&
        new CompressionPlugin({
          filename: '[path][base].br',
          algorithm: 'brotliCompress',
          test: /\.(js|css|html|svg)$/,
          compressionOptions: {
            level: 11,
          },
          threshold: 10240,
          minRatio: 0.8,
        }),
      new ModuleFederationPlugin({
        name: 'mf_boilderplate_app',
        filename: 'remoteEntry.js',
        exposes: {
          './MFBoilerPlate': './src/index.ts',
        },
        shared: {
          react: { singleton: true, requiredVersion: devDependencies.react },
          'react-dom': { singleton: true, requiredVersion: devDependencies['react-dom'] },
          'react-router-dom': {
            singleton: true,
            requiredVersion: devDependencies['react-router-dom'],
          },
          '@tanstack/react-query': {
            singleton: true,
            requiredVersion: devDependencies['@tanstack/react-query'],
          },
          '@cko/dashboard-shared': {
            singleton: true,
            requiredVersion: devDependencies['@cko/dashboard-shared'],
          },
          'styled-components': {
            singleton: true,
            requiredVersion: devDependencies['styled-components'],
          },
          '@cko/primitives': {
            singleton: true,
            requiredVersion: devDependencies['@cko/primitives'],
          },
          '@cko/icons': {
            singleton: true,
            requiredVersion: devDependencies['@cko/icons'],
          },
          '@okta/okta-react': {
            singleton: true,
            requiredVersion: devDependencies['@okta/okta-react'],
          },
        },
      }),
      new NodePolyfillPlugin(),
    ].filter(Boolean),
    resolve: {
      modules: ['src', 'node_modules'],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },
    module: {
      rules: [
        {
          test: /\.m?js/,
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
                plugins: [!production && require.resolve('react-refresh/babel')].filter(Boolean),
              },
            },
          ],
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(gif|jpe?g|png|ttf|woff2?|eot|svg)$/,
          use: [{ loader: 'url-loader', options: { limit: 10000 } }],
        },
      ],
    },
  };
};

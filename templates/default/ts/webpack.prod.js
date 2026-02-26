const { merge } = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const common = require('./webpack.common.js');
const moduleFederationConfig = require('./moduleFederationConfig.js');
const { mfe, version: packageVersion } = require('./package.json');

const cpuCount = process.env.CPU_COUNT && parseInt(process.env.CPU_COUNT, 10);
const version = process.env.VERSION_NUMBER || packageVersion;
const ASSET_PATH_PREFIX = `${mfe.path}/${version}/`;

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  output: {
    clean: true,
    filename: `${ASSET_PATH_PREFIX}[name].[chunkhash].js`,
    chunkFilename: `${ASSET_PATH_PREFIX}[name].[chunkhash].js`,
    path: path.resolve(__dirname, './dist'),
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: { ecma: 8 },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
          },
          mangle: { safari10: true },
          keep_classnames: false,
          keep_fnames: false,
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
        parallel: cpuCount || true,
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: ['default', { minifyFontValues: { removeQuotes: false } }],
          processorOptions: {
            parser: safePostCssParser,
            map: false,
          },
        },
      }),
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CaseSensitivePathsPlugin(),
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
    new CompressionPlugin({
      filename: '[path][base].br',
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg)$/,
      compressionOptions: { level: 11 },
      threshold: 10240,
      minRatio: 0.8,
    }),
    new webpack.EnvironmentPlugin(['BASE_URL', 'APP_API_BASE_URL']),
    moduleFederationConfig(ASSET_PATH_PREFIX),
  ],
});

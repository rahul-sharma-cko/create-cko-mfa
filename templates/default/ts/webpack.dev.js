const { merge } = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const common = require('./webpack.common.js');
const moduleFederationConfig = require('./moduleFederationConfig.js');
const sourcemapsConfig = require('./sourcemapsConfig.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
    publicPath: 'auto',
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    proxy: [
      {
        context: ['/'],
        // Replace with your backend API URL:
        target: 'https://your-api-qa.ckotech.co/api',
        changeOrigin: true,
        secure: false,
      },
    ],
    compress: true,
    port: 3050,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshWebpackPlugin(),
    new CleanWebpackPlugin(),
    new CaseSensitivePathsPlugin(),
    new webpack.EnvironmentPlugin({
      BASE_URL: 'http://localhost:3050',
      APP_API_BASE_URL: 'http://localhost:3050',
    }),
    moduleFederationConfig(),
    sourcemapsConfig(),
  ],
});

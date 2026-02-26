const SourceMapDevToolPlugin = require('webpack').SourceMapDevToolPlugin;

const sourcemapsConfig = () =>
  new SourceMapDevToolPlugin({
    noSources: false,
    filename: '[file].map',
  });

module.exports = sourcemapsConfig;

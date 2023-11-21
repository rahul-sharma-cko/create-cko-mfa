module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        corejs: 3,
        useBuiltIns: 'entry',
      },
    ],
    '@babel/typescript',
    '@babel/react',
  ],
  plugins: [
    'inline-react-svg',
    '@babel/proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import',
  ],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            corejs: 3,
            modules: 'commonjs',
            useBuiltIns: 'entry',
            targets: {
              node: 'current',
            },
          },
        ],
        '@babel/typescript',
        '@babel/react',
      ],
      plugins: ['@babel/proposal-class-properties', '@babel/plugin-syntax-dynamic-import'],
    },
  },
};

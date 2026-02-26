module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        corejs: 3,
        useBuiltIns: 'entry',
        targets: {
          esmodules: true,
        },
      },
    ],
    '@babel/typescript',
    '@babel/react',
  ],
  plugins: [
    'inline-react-svg',
    '@babel/proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import',
    ['babel-plugin-styled-components', { displayName: false, pure: true }],
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

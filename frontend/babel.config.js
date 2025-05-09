// frontend/babel.config.js
module.exports = {
    presets: [
      '@babel/preset-env',
      ['@babel/preset-react', { runtime: 'automatic' }]
    ],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-transform-class-properties', { loose: true }]
    ]
  };
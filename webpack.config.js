const path = require('path');

module.exports = {
  entry: {
    background: './src/background/background.ts',
    content: './src/content_scripts/content.ts',
    popup: './src/popup/popup.tsx'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]/[name].js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: true,
                exportLocalsConvention: 'camelCase',
                localIdentName: '[name]__[local]--[hash:base64:5]'
              }
            }
          }
        ]
      }
    ]
  },
  mode: process.env.NODE_ENV || 'development',
  devtool: 'cheap-module-source-map'
};
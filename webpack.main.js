const path = require('path');
const webpack = require('webpack');

const distPath = path.resolve(__dirname, 'dist');
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  target: 'electron-main',
  entry: './src/main/index.ts',
  output: {
    filename: 'main.js',
    chunkFilename: 'main.bundle.js',
    path: distPath,
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: !isProduction,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  devtool: isProduction ? false : 'inline-source-map',
};

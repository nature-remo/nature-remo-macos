const path = require('path');
const WebpackBar = require('webpackbar');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const distPath = path.resolve(__dirname, 'dist');
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  target: 'electron-renderer',
  entry: './src/renderer/index.tsx',
  output: {
    filename: 'renderer.js',
    chunkFilename: 'renderer.bundle.js',
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
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'main', 'index.html'),
    }),
    new WebpackBar(),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  devtool: isProduction ? false : 'inline-source-map',
  devServer: {
    port: 8090,
  },
};

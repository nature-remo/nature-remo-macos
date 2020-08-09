const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  webpack: {
    configure: {
      target: 'electron-renderer',
      output: {
        publicPath: isDevelopment ? undefined : '.',
      },
    },
  },
};

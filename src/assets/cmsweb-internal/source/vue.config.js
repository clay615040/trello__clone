const path = require('path');
const CompressionWebpackPlugin = require('compression-webpack-plugin')
let publicPath = '/';
//sing-app-vue/

process.env.VUE_APP_VERSION = process.env.VERSION

module.exports = {
  publicPath,
  productionSourceMap: false,
  runtimeCompiler: true,
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      const terserWebpackPlugin = config.optimization.minimizer[0];
      const terserOptions = terserWebpackPlugin.options.terserOptions;
      terserOptions.mangle = {
        reserved: ['$super']
      };
    }
    config.resolve.alias["jquery"] = path.join(__dirname, "./jqueryStub.js");
    config.output.filename = '[name].[hash:5].js';
    config.output.chunkFilename= 'chunk[id].[hash:5].js';
    config.plugins.push(
      new CompressionWebpackPlugin({
        algorithm: 'gzip',
        test: /\.js$/,
        threshold: 1024,
        minRatio: 0.8
      }) 
    )
  },
};
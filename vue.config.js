
module.exports = {
  /*
  devServer: {
    clientLogLevel: 'info',
    watchOptions: {
      poll: true
    }
  },
  configureWebpack: {
    devtool: 'source-map',
    devServer: {
      disableHostCheck: true,
      clientLogLevel: 'info',
      watchOptions: {
        poll: true
      }
    }
  },
  */
  chainWebpack: (config) => {

    config.plugin('define').tap((definitions) => {
      const date = new Date();


      definitions[0]['process.env'] = Object.assign(definitions[0]['process.env'], {
        'BUILD_DATE': JSON.stringify(date.toString())
      });

      /*
      definitions.push({
        'process.env': {
          'BUILD_DATE': JSON.stringify(date.toString())
        }
      });
      */

      /*
      definitions[0] = Object.assign(definitions[0], {
        'process.env': {
          'BUILD_DATE': JSON.stringify(date.toString())
        }
      });
      */

      return definitions;
    })
  },

  productionSourceMap: false,
  lintOnSave: false,
}

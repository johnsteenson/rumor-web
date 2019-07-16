
module.exports = {
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
  } 
}

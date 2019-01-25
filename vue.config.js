
module.exports = {
  devServer: {
    clientLogLevel: 'info',
    watchOptions: {
        poll: true
    }
  },
  configureWebpack: {
    devServer: {
	disableHostCheck: true,
        clientLogLevel: 'info',
        watchOptions: {
            poll: true
        }
    }
  } 
}

const { defineConfig } = require('@vue/cli-service')

delete process.env.NODE_OPTIONS;

module.exports = defineConfig({
  transpileDependencies: true, 
  pluginOptions: {
    electronBuilder: {
      "build": {
        "appId": "com.laitaucafe.ow2scoreboard",
        "productName": "OW2Scoreboard"
      },
      preload: 'src/preload.js', 
      customFileProtocol: './',
    }
  }
})

const WebSocket = require('ws')
const webSocketServer = new WebSocket.Server({ port: 8080 })
const crypto = require('./encryptionWrapper')

var [privateKey, pu] = crypto.getKeys()
var clientKey = null;
webSocketServer.on('connection', function connection(socket) {
  socket.on('message', function incoming(message) {
    if (message.includes('BEGIN PUBLIC KEY')) {
      clientKey = crypto.importKey(message)
      var exportableKey = crypto.exportKey(pu)
      socket.send(exportableKey);
    }
    else {
      var packets = message.split('&---&')
      var message = crypto.decodeArray(privateKey,packets)
      message = message.split('<=======')

      var verified = clientKey.verify(message[0], message[1])
      console.log(verified)
      socket.send('ok!')
    }

  })
})
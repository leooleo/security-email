const WebSocket = require('ws')
const webSocketServer = new WebSocket.Server({ port: 3000 })
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
    else if(message == 'ping') {
      socket.send('pong')
    }
    else {
      var packets = message.split('&---&')
      var message = crypto.decodeArray(privateKey,packets)
      message = message.split('<=======')

      var verified = clientKey.verify(message[0], message[1])
      console.log(verified)
      var responseMessage = ''
      if(verified) {
        responseMessage = 'verified'
      }
      else {
        responseMessage = 'error'
      }

      responseMessage = clientKey.encrypt(responseMessage)
      socket.send(responseMessage)      
    }

  })
})
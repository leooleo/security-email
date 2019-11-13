const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8080');
const crypto = require('./encryptionWrapper')

var [privateKey, publicKey] = crypto.getKeys()
var serverKey = null


function preparePacket() {
  var pack = crypto.prepareDigitalSignature(privateKey)
  if(serverKey != null) {
    pack = crypto.encryptArray(serverKey, pack)    
  }
  else {
    console.log('Server key null')
    pack = null
  }
  return pack
}

ws.on('open', function open() {
  var exportableKey = crypto.exportKey(publicKey)
  ws.send(exportableKey);
  console.log('sent');
});

ws.on('message', function incoming(message) {
  if (message.includes('BEGIN PUBLIC KEY')) {
    serverKey = crypto.importKey(message)
    var packet = preparePacket()
    console.log(packet);    
    console.log(typeof packet);
    ws.send(packet[0] + '&---&' + packet[1])
  }
  else {    
    console.log('received');
    console.log(message);
    ws.close()
  }

});
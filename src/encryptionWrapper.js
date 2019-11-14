const NodeRSA = require('node-rsa');

function generateKeyPair() {
    console.log('Generating key Pair...')
    var keyPair = new NodeRSA()
    keyPair.generateKeyPair()

    console.log('Generated!')
    return keyPair
}

function getPublicKey(keys) {
    return keys.exportKey('public')
}

function setPublicKey(pemFile) {
    var key = new NodeRSA()
    return key.importKey(pemFile,'public')
}

module.exports.generateKeyPair = generateKeyPair
module.exports.getPublicKey = getPublicKey
module.exports.setPublicKey = setPublicKey

// Usage
// const serverKeys = generateKeyPair()
// const clientKeys = generateKeyPair()

// var pemServer = getPublicKey(serverKeys)
// var pemClient = getPublicKey(clientKeys)

// var publicServerKey = setPublicKey(pemServer)
// var publicClientKey = setPublicKey(pemClient)

// var message = serverKeys.encryptPrivate('Fala meu irmao tudo bom?', 'base64')
// message = publicClientKey.encrypt(message, 'base64')

// message = clientKeys.decrypt(message, 'utf8')
// message = publicServerKey.decryptPublic(message, 'utf8')
// console.log(message);

// const keyServer = new NodeRSA();
// keyServer.generateKeyPair();

// const keyClient = new NodeRSA();
// keyClient.generateKeyPair();

// console.log('Exchanging keys...');

// var exported = keyServer.exportKey('public')

// var serverPublicKey = new NodeRSA();
// serverPublicKey.importKey(exported,'public')

// exported = keyClient.exportKey('public')

// var clientPublicKey = new NodeRSA();
// clientPublicKey.importKey(exported,'public')

// console.log('exchanged!');

// var message = 'Um criptograma'

// message = keyClient.encryptPrivate(message, 'base64')
// message = serverPublicKey.encrypt(message, 'base64')

// console.log(message);

// message = keyServer.decrypt(message, 'utf8')
// message = clientPublicKey.decryptPublic(message, 'utf8')

// console.log(message);
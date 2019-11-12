var forge = require('node-forge');

var rsa = forge.pki.rsa;
var pki = forge.pki;

function getKeys() {
    var keyPair = rsa.generateKeyPair({ bits: 2048})
    var private = keyPair.privateKey;
    var public = keyPair.publicKey;

    return [private, public]
}

function prepareDigitalSignature(privateKey) {
    var dig = forge.md.sha1.create()
    dig.update('random string', 'utf8')
    var signature = privateKey.sign(dig)
    var digested = dig.digest().bytes()

    var message = digested + '<=======' + signature
    console.log(message.length)
    var firstHalf = message.slice(0, message.length / 2)
    var secondHalf = message.slice(message.length / 2, message.length)

    return [firstHalf, secondHalf]
}

function encryptArray(publicKey, array) {
    for(let i=0;i< array.length; i++) {
        array[i] = publicKey.encrypt(array[i])
    }

    return array
}

function decodeArray(privateKey, array) {
    for(let i=0;i<2; i++) {
        array[i] = privateKey.decrypt(array[i])
    }

    return array[0] + array[1]
}

function exportKey(publicKey) {
   return pki.publicKeyToPem(publicKey)
}

function importKey(pem) {
    return pki.publicKeyFromPem(pem)
}

module.exports.getKeys = getKeys
module.exports.prepareDigitalSignature = prepareDigitalSignature
module.exports.encryptArray = encryptArray
module.exports.decodeArray = decodeArray
module.exports.exportKey = exportKey
module.exports.importKey = importKey
var [privateKeyA, publicKeyA] = getKeys()
var p = exportKey(publicKeyA)
var pe = importKey(p)
console.log(p)
console.log('\n\n')
console.log(exportKey(pe))


// USAGE
// var [privateKeyA, publicKeyA] = getKeys()
// var [privateKeyB, publicKeyB] = getKeys()

// var array = prepareDigitalSignature(privateKeyA)
// var message = array[0] + array[1]
// array = encryptArray(publicKeyB, array)

// //send array

// var newMessage = decodeArray(privateKeyB,array);

// console.log(newMessage == message)
// var spl = newMessage.split('<=======')
// var a = spl[0]
// var b = spl[1]

// var verified = publicKeyA.verify(a, b)
// console.log(verified)
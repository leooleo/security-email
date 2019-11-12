var forge = require('node-forge');

var rsa = forge.pki.rsa;

var keypairA = rsa.generateKeyPair({bits: 2048, e: 0x10001})
var privateKeyA = keypairA.privateKey;
var publicKeyA = keypairA.publicKey;

var keypairB = rsa.generateKeyPair({bits: 2048, e: 0x10001})
var privateKeyB = keypairB.privateKey;
var publicKeyB = keypairB.publicKey;

var dig = forge.md.sha1.create()
dig.update('Leozera aqui','utf8')
var signature = privateKeyA.sign(dig)
var digested = dig.digest().bytes()

var message = digested + '<=======' + signature
var firstHalf = message.slice(0,message.length/2)
var secondHalf = message.slice(message.length/2,message.length)

var firstEnc = publicKeyB.encrypt(firstHalf)
var secondEnc = publicKeyB.encrypt(secondHalf)

var firstDec = privateKeyB.decrypt(firstEnc)
var secondDec = privateKeyB.decrypt(secondEnc)

var newMessage = firstDec + secondDec;

console.log(newMessage == message)
var spl = newMessage.split('<=======')
var a = spl[0]
var b = spl[1]

var verified = publicKeyA.verify(a, b)
console.log(verified)
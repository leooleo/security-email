var keys = null
var publicKey = null
var serverPublic = null
var myName = null
var password = null

var socket

// communication is started by sendind local public key
window.startCommunication = function startCommunication(name, pwd) {
    myName = name
    password = pwd
    keys = generateKeyPair()
    publicKey = getPublicKey(keys)
    socket.send(publicKey + 'user:' + myName)
}

window.sendMessage = function sendMessage(message) {
    socket.send(message)
}

const openWs = (event) => {
    console.log("[open] Connection established")
}
const messageWs = (event) => {
    var message = event.data

    if (message.includes('BEGIN PUBLIC KEY')) {
        serverPublic = setPublicKey(message)
        console.log("[crypto] Exchanged public keys")
        var encryptedPrk = CryptoJS.AES.encrypt(keys.exportKey('private'), password)
        var salt = CryptoJS.lib.WordArray.random(128 / 8)

        localStorage.setItem('prk', encryptedPrk.toString());
        localStorage.setItem('puk', keys.exportKey('public'));
        localStorage.setItem('sek', serverPublic.exportKey('public'));
        localStorage.setItem('pwd', CryptoJS.SHA512(password + salt).toString())
        localStorage.setItem('salt', salt)
        document.location.href = '/';
    }
    else {
        console.log(message);
    }
}

const closeWs = (event) => {
    if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`)
    } else {
        console.log('[close] Connection died')
    }
    console.log('[reconnect] Trying to reconnect')
    connectSocket()
}

const errorWs = (error) => {
    console.log(`[error] ${error.message}`)
}

function connectSocket() {
    socket = new WebSocket('wss://meomail.herokuapp.com/')
    socket.addEventListener('open', openWs)
    socket.addEventListener('message', messageWs)
    socket.addEventListener('close', closeWs)
    socket.addEventListener('error', errorWs)
}

connectSocket()
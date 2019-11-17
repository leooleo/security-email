var keys = null
var publicKey = null
var serverPublic = null
var myName = null
var password = null

let socket = new WebSocket("ws://192.168.5.107:8080/")

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

socket.onopen = function (e) {
    console.log("[open] Connection established")
    // socket.send(publicKey + 'user:' + myName)
}

socket.onmessage = function (event) {
    var message = event.data    

    if (message.includes('BEGIN PUBLIC KEY')) {
        serverPublic = setPublicKey(message)
        console.log("[crypto] Exchanged public keys")
        var encryptedPrk = CryptoJS.AES.encrypt(keys.exportKey('private'), password)
        var salt = CryptoJS.lib.WordArray.random(128/8)

        localStorage.setItem('prk', encryptedPrk.toString());
        localStorage.setItem('puk', keys.exportKey('public'));
        localStorage.setItem('sek', serverPublic.exportKey('public'));
        localStorage.setItem('pwd', CryptoJS.SHA512(password + salt).toString())
        localStorage.setItem('salt', salt)
        document.location.href = '/';
        // var obj = { 'user': myName, 'data': 'Olá Amigo, tudo bom?' }
        // var packet = JSON.stringify(obj)
        // packet = keys.encryptPrivate(packet, 'base64')
        // packet = serverPublic.encrypt(packet + 'user:' + myName, 'base64')

        // socket.send(packet)
    }
    else {
        console.log(message);
    }
}

socket.onclose = function (event) {
    if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`)
    } else {
        console.log('[close] Connection died')
    }
    console.log('[reconnect] Trying to reconnect')
    socket = new WebSocket("ws://192.168.5.107:8080/")
}

socket.onerror = function (error) {
    console.log(`[error] ${error.message}`)
}
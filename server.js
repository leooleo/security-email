const WebSocket = require('ws')
const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const crypto = require('./src/encryptionWrapper')
const cors = require('cors')
const fs = require('fs')
const CryptoJS = require("crypto-js")

var root = __dirname + '/files/'

app.use(cors())

const server = app.listen(port, () => console.log(`Listening on port ${port}!`))
const webSocketServer = new WebSocket.Server({ server: server })

var privateKey = null
var publicKey = null
var clients = {}
var sentMessages = {}
var arrivedMessages = {}

getKeys()

app.get('/signup', function (req, res) {
    res.sendFile(root + 'signup.html')
})

app.get('/', function (req, res) {
    res.sendFile(root + 'signin.html')
})

app.get('/index', function (req, res) {
    res.sendFile(root + 'index.html')
})

app.get('/arrived/:client', function (req, res) {
    var client = req.params.client;
    var packet = arrivedMessages[client]
    res.json(packet)
})

app.get('/sent/:client', function (req, res) {
    var client = req.params.client;
    var packet = sentMessages[client]
    res.json(packet)
})

app.get('/clear', function (req, res) {
    clients = {}
    sentMessages = {}
    arrivedMessages = {}
    res.send('ok')
})

app.get('/key/:client', function (req, res) {
    var client = req.params.client
    if (client in clients) {
        var packet = crypto.getPublicKey(clients[client])
        res.send(packet)
    }
    else {
        res.send('no such client')
    }
})

app.get('/client/:client', function (req, res) {
    var client = req.params.client
    if (client in clients) {
        res.send('taken')
    }
    else {
        res.send('no such client')
    }
})

app.get('/bundle.js', function (req, res) {
    res.type('.js')
    res.sendFile(root + 'bundle.js')
})

app.get('/crypto-js.js', function (req, res) {
    res.type('.js')
    // res.sendFile(__dirname + '/bower_components/crypto-js/crypto-js.js')
    res.sendFile(root + 'crypto-js.js')

})

app.get('/websocket.js', function (req, res) {
    res.type('.js')
    res.sendFile(root + 'websocket.js')
})

webSocketServer.on('connection', function connection(socket) {
    socket.on('message', function incoming(message) {
        if (message.includes('BEGIN PUBLIC KEY')) {
            handlePublicKey(message)
            socket.send(crypto.getPublicKey(publicKey))
            console.log('Exchanged public keys!')
        }
        else {
            handleMessage(message)
        }
    })
})

function handlePublicKey(message) {
    message = message.split('user:')
    var clientPublicKey = crypto.setPublicKey(message[0])
    var userName = message[1]

    clients[userName] = clientPublicKey

    console.log('Received public key from client ' + userName)
}

function handleMessage(message) {
    try {
        console.log('Received message')
        var decrypted = privateKey.decrypt(message, 'utf-8')
        var packet = JSON.parse(decrypted)

        var destinatary = packet['destinatary']
        var message = packet['message']
        var sender = packet['sender']
        var hash = CryptoJS.SHA512(message + sender + destinatary).toString()

        if (hash == packet['hash']) {
            console.log('Message hash verified')
        }
        else {
            console.log('Message was corrupted!')
            return
        }

        var thisClientKey = clients[sender]

        var finalMessage = thisClientKey.decryptPublic(message, 'utf-8')
        var receivedPacket = JSON.parse(finalMessage)

        if (destinatary in arrivedMessages) {
            arrivedMessages[destinatary].push({ 'sender': sender, 'message': receivedPacket['destinatary'] })
        }
        else {
            arrivedMessages[destinatary] = [{ 'sender': sender, 'message': receivedPacket['destinatary'] }]
        }
        if (sender in sentMessages) {
            sentMessages[sender].push({ 'destinatary': destinatary, 'message': receivedPacket['sender'] })
        }
        else {
            sentMessages[sender] = [{ 'destinatary': destinatary, 'message': receivedPacket['sender'] }]
        }

    } catch (error) {
        console.log(error)
        console.log('Plain text message: ' + message)
    }
}

function getKeys() {
    if (!fs.existsSync('ssl/')) {
        fs.mkdirSync('ssl/');
    }
    // Check if there are keys already stored
    var files = fs.readdirSync('ssl/')
    // If there aren't create and store new ones
    if (files.length == 0) {
        var keys = crypto.generateKeyPair()
        fs.writeFileSync('ssl/public.pem', keys.exportKey('public'))
        fs.writeFileSync('ssl/private.pem', keys.exportKey('private'))
    }

    console.log('Reading key Pair...')
    var content = fs.readFileSync('ssl/public.pem')
    publicKey = crypto.setPublicKey(content)
    content = fs.readFileSync('ssl/private.pem')
    privateKey = crypto.setPrivateKey(content)
    console.log('Readed!')

}

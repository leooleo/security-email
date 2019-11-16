const WebSocket = require('ws')
const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const crypto = require('./src/encryptionWrapper')
const cors = require('cors');

var root = __dirname + '/files/'

app.use(cors())

const server = app.listen(port, () => console.log(`Listening on port ${port}!`))
const webSocketServer = new WebSocket.Server({ server: server })

var keys = crypto.generateKeyPair()
var publicKey = crypto.getPublicKey(keys)
var clients = {}

app.get('/signup', function (req, res) {
    res.sendFile(root + 'signup.html');
})

app.get('/signin', function (req, res) {
    res.sendFile(root + 'signin.html');
})

app.get('/index', function (req, res) {
    res.sendFile(root + 'index.html');
})

app.get('/key/:client', function (req, res) {
    var client = req.params.client
    console.log(client);
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
    console.log(client);
    if (client in clients) {        
        res.send('taken')
    }
    else {
        res.send('no such client')
    }
})

app.get('/bundle.js', function (req, res) {
    res.type('.js')
    res.sendFile(root + 'bundle.js');
})

app.get('/signupWs.js', function (req, res) {
    res.type('.js')
    res.sendFile(root + 'signupWs.js');
})

webSocketServer.on('connection', function connection(socket) {
    console.log('Connected')
    socket.on('message', function incoming(message) {
        if (message.includes('BEGIN PUBLIC KEY')) {
            handlePublicKey(message)
            socket.send(publicKey)
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
        var decrypted = keys.decrypt(message, 'utf-8')        
        decrypted = decrypted.split('user:')

        var packet = decrypted[0]
        var userName = decrypted[1]

        var thisClientKey = clients[userName]

        var finalMessage = thisClientKey.decryptPublic(packet, 'utf-8')
        console.log('Final message: ' + finalMessage);
        // var thisClientKey
    } catch (error) {
        console.log('Plain text message: ' + message);
    }
}
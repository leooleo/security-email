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
var sentMessages = {}
var arrivedMessages = {}

app.get('/signup', function (req, res) {
    res.sendFile(root + 'signup.html');
})

app.get('/', function (req, res) {
    res.sendFile(root + 'signin.html');
})

app.get('/index', function (req, res) {
    res.sendFile(root + 'index.html');
})

app.get('/arrived/:client', function (req, res) {
    var client = req.params.client;
    var packet = arrivedMessages[client]
    res.json(packet);
})

app.get('/sent/:client', function (req, res) {
    var client = req.params.client;
    var packet = sentMessages[client]
    res.json(packet);
})

app.get('/clear', function (req, res) {
    clients = {}
    sentMessages = {}
    arrivedMessages = {}
    res.send('ok');
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
    res.sendFile(root + 'bundle.js');
})

app.get('/signupWs.js', function (req, res) {
    res.type('.js')
    res.sendFile(root + 'signupWs.js');
})

webSocketServer.on('connection', function connection(socket) {
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
        var packet = JSON.parse(decrypted)

        var destinatary = packet['destinatary']
        var message = packet['message']
        var sender = packet['sender']

        var thisClientKey = clients[sender]

        var finalMessage = thisClientKey.decryptPublic(message, 'utf-8')
        var receivedPacket = JSON.parse(finalMessage)

        if(destinatary in arrivedMessages) {
            arrivedMessages[destinatary].push({'sender': sender, 'message' : receivedPacket['destinatary']})
        }
        else {
            arrivedMessages[destinatary] = [{'sender': sender, 'message' : receivedPacket['destinatary']}]
        }
        if(sender in sentMessages) {
            sentMessages[sender].push({'destinatary': destinatary, 'message': receivedPacket['sender']})
        }
        else {
            sentMessages[sender] = [{'destinatary': destinatary, 'message': receivedPacket['sender']}]
        }

    } catch (error) {
        console.log('Plain text message: ' + message);
    }
}

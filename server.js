const WebSocket = require('ws')
const express = require('express')
const app = express()
const port = 8080
const crypto = require('./src/encryptionWrapper')

var root = __dirname + '/files/'

const server = app.listen(port, () => console.log(`Listening on port ${port}!`))
const webSocketServer = new WebSocket.Server({ server: server })

var keys = crypto.generateKeyPair()
var publicKey = crypto.getPublicKey(keys)
var clientPublicKey = null

app.get('/', function (req, res) {
    res.sendFile(root + 'other.html');
})

app.get('/bundle.js', function (req, res) {
    res.type('.js')
    res.sendFile(root + 'bundle.js');
})

webSocketServer.on('connection', function connection(socket) {
    console.log('Connected')
    socket.on('message', function incoming(message) {
        if (message.includes('BEGIN PUBLIC KEY')) {
            clientPublicKey = crypto.setPublicKey(message)
            socket.send(publicKey)
            console.log('Exchanged public keys!')
        }
        else {
            message = keys.decrypt(message, 'utf-8')
            console.log(message);
        }
    })
})
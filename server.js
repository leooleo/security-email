const express = require('express')
const app = express()
const port = 8080

var root = __dirname + '/files/'

app.get('/', function(req, res) {
    res.sendFile(root + 'index.html');
})

app.listen(port, () => console.log(`Listening on port ${port}!`))
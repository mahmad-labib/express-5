const express = require('express')
const https = require("https")
global.createError = require('http-errors')
const { conf } = require('./conf/default')
const path = require('path')
global.app = express()
var fs = require('fs');
var cors = require('cors')
app.use(cors())

var privateKey = fs.readFileSync('server.key', 'utf8');
var certificate = fs.readFileSync('server.cert', 'utf8');

var credentials = { key: privateKey, cert: certificate };

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('public'))

require(path.join(__dirname, "./conf/response_code.js"))

//import JWT globaly
global.jwt = require('jsonwebtoken');
global.jwt_secret = require('./conf/jwt')
require(path.join(__dirname, "/middleware/auth.js"))

//middleware
require(path.join(__dirname, "/api/userController/user.js"));
require(path.join(__dirname, "/api/userController/favorites.js"));
require(path.join(__dirname, "/api/userController/news.js"));
require(path.join(__dirname, "/api/adminController/users.js"));
require(path.join(__dirname, "/api/adminController/roles.js"));
require(path.join(__dirname, "/api/adminController/sections.js"));
require(path.join(__dirname, "/api/adminController/articles.js"));
require(path.join(__dirname, "/api/juniorController/articles.js"));
require(path.join(__dirname, "/api/moderatorController/pending-articles.js"));
require(path.join(__dirname, "/mysql"));

app.use((req, res, next) => {
  next(createError(404))
})

app.use((err, req, res, next) => {

  res.status(err.status || 500)
  res.json({
    status: err.status,
    message: err.message,
    stack: err.stack
  })

})

const port = conf.port;

https.createServer(credentials, app).listen(port);
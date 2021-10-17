const express = require('express')
global.createError = require('http-errors')
const {
  conf
} = require('./conf/default')
const path = require('path')
global.app = express()



var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('public'))

require(path.join(__dirname, "./conf/response_code.js"))

//import JWT globaly
global.jwt = require('jsonwebtoken');
global.jwt_secret = require('./conf/jwt')
require(path.join(__dirname, "/middleware/auth.js"))



;
//middleware


require(path.join(__dirname, "/api/user.js"));
require(path.join(__dirname, "/api/adminController/users.js"));
require(path.join(__dirname, "/api/adminController/roles.js"));
require(path.join(__dirname, "/api/adminController/sections.js"));
require(path.join(__dirname, "/api/adminController/articles.js"));
require(path.join(__dirname, "/mysql"));

app.use((req, res, next) => {
  next(createError(404))
})

app.use((error, req, res, next) => {
  res.status(error.status || 500)
  res.json({
    status: error.status,
    message: error.message,
    stack: error.stack
  })
})

const port = conf.port

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
const express = require('express')
global.createError = require('http-errors')
const multer = require('multer');
const {
  conf
} = require('./conf/default')
const path = require('path')
global.app = express()
var bodyParser = require('body-parser')
require(path.join(__dirname, "./conf/response_code.js"))

//import JWT globaly
global.jwt = require('jsonwebtoken');
global.jwt_secret = require('./conf/jwt')
require(path.join(__dirname, "/middleware/auth.js"))



global.app.use(bodyParser.urlencoded({
  extended: true
}));
global.app.use(bodyParser.json());

//file upload
var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'images')
  },
  filename: function (req, file, callback) {
    callback(null, file.orignalname);
  }
});
var upload = multer({
storage: Storage 
}).array('image', 3);
//route
app.post('/', (req, res) => {});

app.post('/upload', (req, res) => {
  console.log(req.file);
  upload(req, res , err => {
      if (err) {
          console.log(err);
          return res.send('somthing went wrong');
      }
      return res.send('file uploaded successfully');
  });
});
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
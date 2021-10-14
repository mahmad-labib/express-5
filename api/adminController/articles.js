const {
  User,
  Role,
  Article,
  Section
} = require('../../mysql');

var {
  roles
} = require('../../conf/default')
var admin = roles.admin;

var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});


var upload = multer({ storage: storage })

global.app.post('/upload', global.grantAccess('admin'), upload.array('image', 10), (req, res) => {
  var { uploadName } = req.body;
  if (uploadName === 'article') {
    articleUpload(req, res)
  }
  throw createError(404)
});

global.app.post('/admin/article', articleUpload);

function articleUpload(req, res) {
  res.send(req.files)
}
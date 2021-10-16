const {
  User,
  Role,
  Article,
  Section
} = require('../../mysql');
var fs = require('fs');
var {
  roles
} = require('../../conf/default')
var admin = roles.admin;

var multer = require('multer');

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = `./uploads/${req.user.id}/${req.article.id}`
    fs.access(dest, function (error) {
      if (error) {
        console.log("Directory does not exist.");
        return fs.mkdir(dest, (error) => cb(error, dest));
      } else {
        console.log("Directory exists.");
        return cb(null, dest);
      }
    });
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});


var upload = multer({ storage: storage })



global.app.post('/upload', global.grantAccess(admin), async (req, res) => {
  console.log(req.body)
  var { uploadName } = req.body;
  if (uploadName == 'article') {
    var article = await articleUpload;
    req.article = article;
    app.use(upload.array('image', 10))
  } else {
    throw createError(404)
  }
});

global.app.post('/admin/article', articleUpload);


async function articleUpload(data) {
  var { content, title, section } = data;
  var query = await Article.create({ title, content });
  if (query) {
    var attach_secions = await query.setSections(section);
    if (!attach_secions) {
      query.destroy();
      throw createError(405)
    }
    return query;
  } else {
    throw createError(406)
  }
}
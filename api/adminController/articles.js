const {
  User,
  Role,
  Article,
  Section,
  Image
} = require('../../mysql');
var fs = require('fs');
var {
  roles
} = require('../../conf/default')
var admin = roles.admin;
const path = require('path')
var multer = require('multer');
const {
  query
} = require('express');

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = `./public/images/${req.user.id}`
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

var upload = multer({
  storage
})

global.app.post('/upload', global.grantAccess(admin), upload.array('image', 12), async (req, res) => {
  var {
    uploadName,
  } = req.body;
  const imagesPath = []
  req.files.forEach(element => {
    imagesPath.push(element.path)
  });

  if (uploadName == 'article') {
    if (imagesPath) {
      var article = await articleUpload(req, imagesPath);
    }
    res.json(article)
  } else {
    throw createError(404)
  }
});

async function articleUpload(req, imagesPath) {
  var {
    content,
    title,
    section
  } = req.body;

  if (!content || !title || !section) {
    throw createError(406)
  }
  try {
    var article = await Article.create({
      title,
      content
    });
    console.log(imagesPath)
    if (article) {
      var attach_secions = await article.setSections(section);
      const paths = [
        'path',
        'path',
        'sdfsdf'
      ]
      paths.forEach(element=>{
        var attach_images = await article.createImage({path: element})
        if (!attach_secions) {
          article.destroy();
          throw createError(406, 'errror with section')
        }
      })


      return attach_images;
    } else {
      deleteImages(imagesPath)
      throw createError(406, 'error with saving article')
    }
  } catch (error) {
    deleteImages(imagesPath)
    Article.destroy({
      where: {
        id: article.id
      }
    });
    throw createError(404, error)
  }

};




async function deleteImages(path) {
  if (Array.isArray(path)) {
    path.forEach(element => {
      fs.unlinkSync(element.path)
    });
    return true
  } else {
    fs.unlinkSync(element)
    return true;
  }
}
// global.app.get('/admin/uploads');

// global.app.post('/admin/article', articleUpload);

// function uploadImages(images, article, userId) {
//   article.setImages(images)
// }

// files.forEach(element => {
//   content = content.replace(element.originalname, url + '/' + element.path);
// });

// var url = req.protocol + '://' + req.get('host')
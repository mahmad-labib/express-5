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
    const dest = `./public/images/`
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
  if (uploadName == 'article') {
    if (req.files) {
      var article = await articleUpload(req);
    }
    res.json(article)
  } else {
    throw createError(404)
  }
});

async function articleUpload(req) {
  var {
    content,
    title,
    section
  } = req.body;
  if (!content || !title || !section) {
    throw createError(406, 'somthing went wrong')
  }
  try {
    req.files.forEach(element => {
      content = content.replace(element.originalname, element.filename);
    });
    var article = await Article.create({
      title,
      content
    });
    if (article) {
      var attach_user = await article.setUsers(req.user.id);
      var attach_secions = await article.setSections(section);
      if (!attach_secions || !attach_user) {
        throw createError(406, 'errror with section')
      }
      req.files.forEach(async element => {
        var attach_image = await article.createImage({
          name: element.filename
        })
        if (!attach_image) {
          throw createError(406, 'errror with saving images')
        }
      })
      return article;
    } else {
      deleteImages(req.files)
      throw createError(406, 'error with saving article')
    }
  } catch (error) {
    deleteImages(req.files)
    Article.destroy({
      where: {
        id: article.id
      }
    });
    throw createError(404, error)
  }

};


async function deleteImages(files) {
  if (Array.isArray(files)) {
    files.forEach(async element => {
      await fs.unlinkSync(element.path || element)
    });
    return true
  } else {
    fs.unlinkSync(element.path)
    return true;
  }
}

//Get Article
global.app.get('/admin/article/:id', async (req, res) => {
  var id = req.params.id;
  var article = await Article.findOne({
    where: {
      id
    }
  })
  var {
    content,
    title
  } = article;
  var images = await article.getImages()
  var url = req.protocol + '://' + req.get('host') + '/images';
  var newArticle = content;
  images.forEach(element => {
    content = newArticle.replace(element.name, url + '/' + element.name);
    newArticle = content
  });
  res.json(new global.sendData('200', {
    title,
    newArticle
  }))
})

// Edit Article
global.app.post('/admin/article/:id', global.grantAccess(admin), upload.array('image', 12), async (req, res) => {
  var id = req.params.id;
  var {
    content,
    title
  } = req.body;
  var article = await Article.findOne({
    where: {
      id
    }
  })
  var images = await article.getImages();
  var keepImages = []
  images.forEach(async element => {
    var check = content.indexOf(element.name)
    if (check > 0) {
      keepImages.push(element.name)
    }
  });
  req.files.forEach(element => {
    var check = content.indexOf(element.originalname)
    if (check) {
      keepImages.push(element.filename)
      content = content.replace(element.originalname, element.filename);
    }
  });
  article.content = content;
  article.title = title;
  var newArticle = await article.save();
  keepImages.forEach(async element => {
    console.log(element)
    var attach_image = await newArticle.createImage({
      name: element
    })
  })
  res.json(new global.sendData(200, newArticle))
  if (!article) {
    throw createError(404, 'article not found')
  }

})


// global.app.get('/admin/uploads');

// global.app.post('/admin/article', articleUpload);

// function uploadImages(images, article, userId) {
//   article.setImages(images)
// }

// files.forEach(element => {
//   content = content.replace(element.originalname, url + '/' + element.path);
// });

// var url = req.protocol + '://' + req.get('host')
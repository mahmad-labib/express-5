const { Article, Image } = require('../../mysql');
var fs = require('fs');
var { roles } = require('../../conf/default')
var admin = roles.admin;

const path = require('path')
var multer = require('multer');
const { query } = require('express');

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

var upload = multer({ storage })

//Get Article
global.app.get('/admin/article/:id', async (req, res) => {
  var id = req.params.id;
  var article = await Article.findOne({ where: { id } })
  var { content, title } = article;
  var images = await article.getImages()
  var url = req.protocol + '://' + req.get('host') + '/images';
  var newArticle = content;
  images.forEach(element => {
    content = newArticle.replace(element.name, url + '/' + element.name);
    newArticle = content
  });
  res.json(new global.sendData('200', { title, newArticle }))
})

//POST Article
global.app.post('/upload', global.grantAccess(admin), upload.array('image', 12), async (req, res) => {
  var { uploadName } = req.body;
  if (uploadName == 'article') {
    if (req.files) { var article = await articleUpload(req); }
    res.json(article)
  } else {
    throw createError(404)
  }
});

// POST Article Function
async function articleUpload(req) {
  var { content, title, section } = req.body;
  if (!content || !title || !section) { throw createError(406, 'somthing went wrong') }
  try {
    req.files.forEach(element => { content = content.replace(element.originalname, element.filename) });
    var article = await Article.create({ title, content });
    await article.setUsers(req.user.id);
    await article.setSections(section);
    req.files.forEach(async element => {
      await article.createImage({ name: element.filename })
    })
    return article;
  } catch (error) {
    DeleteImages(req.files)
    Article.destroy({ where: { id: article.id } });
    throw createError(404, error)
  }

};

// Delete Local Images
async function DeleteImages(files) {
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



// Edit Article
global.app.post('/admin/article/:id', global.grantAccess(admin), upload.array('image', 12), async (req, res) => {
  var id = req.params.id;
  var { content, title } = req.body;
  var url = req.protocol + '://' + req.get('host') + '/images';

  var Entity = { content, title, images: req.files }
  var Model = await Article.findOne({ where: { id }, include: [{ model: Image, attributes: ['name', 'id'] }] })

  var deleteImages = []
  var newImages = []

  Model.images.forEach(image => {
    var check = Entity.content.includes(image.name)
    if (!check) {
      deleteImages.push(image.id)
    }
  })

  Entity.images.forEach(async image => {
    var check = Entity.content.includes(image.originalname)
    if (check) {
      var savedImage = await Image.create({ name: image.filename })
      newImages.push(savedImage);
    } else {
      DeleteImages(image.filename);
    }
  })

  //Make New Article
  Entity.images.forEach(image => {
    Entity.content = Entity.content.replace(image.originalname, image.filename);
  });
  Entity.content = Entity.content.replace(url + '/', '')

  Model.content = Entity.content
  Model.title = Entity.title
  var article = await Model.save();

  //Delete Images
  Image.destroy({ where: { id: [deleteImages] } })

  //Add Article Images
  article.addImages(newImages);

  var sendArticle = await Article.findOne({ where: { id: article.id } })
  res.json(new global.sendData(200, sendArticle))
  if (!article) {
    throw createError(404, 'article not found')
  }

})


//Delete
global.app.delete('/admin/article/:id', global.grantAccess(admin), async (req, res) => {
  var id = req.params.id;
  var article = await Article.destroy({ where: { id } })
  res.json(new global.sendSuccessMsg());
})


//GET ALL
global.app.get('/admin/articles', global.grantAccess(admin), async (req, res) => {
  var url = req.protocol + '://' + req.get('host') + '/admin/article/';
  var articles = Article.findAndCountAll({
    order: [
      ['createdAt', 'ASC'],
    ],
    attributes: ['id', 'title', [sequelize.fn(url+'id' AS Url), 'mc'] ],
    limit: 20,
    offset: req.body.page || 0
  })


})
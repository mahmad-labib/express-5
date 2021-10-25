const { Article, Image, User, Section, sequelize } = require('../../mysql');
const { Op } = require("sequelize");
var DeleteImages = require('../../middleware/general')

var fs = require('fs');
var { roles, upload } = require('../../conf/default');
const { RSA_NO_PADDING } = require('constants');
var junior = roles.junior;
const dest = `./public/images/`;


// GET
global.app.get('/junior/article/:id', async (req, res) => {
  var id = req.params.id;
  var article = await Article.findOne({ where: { id } })
  if (article) {
    var images = await article.getImages()
    var url = req.protocol + '://' + req.get('host') + '/images';
    images.forEach(element => {
      article.content = article.content.replace(element.name, url + '/' + element.name);
    });
    res.json(new global.sendData('200', { article }))
  } else {
    throw createError(404);
  }
})



//POST Article
global.app.post('/junior/upload', global.grantAccess(junior), upload.array('image', 12), async (req, res) => {
  var { uploadName } = req.body;
  if (uploadName == 'article') {
    if (req.files) {
      var article = await articleUpload(req);
      res.json(new global.sendData(200, article))
    }
  } else {
    throw createError(404)
  }
});

async function articleUpload(req) {
  var { content, title, section } = req.body;
  var state = 'pending'
  var section = await Section.findOne({ where: { id: section } })
  if (!content || !title || !section) { throw createError(406, 'somthing went wrong') }
  req.files.forEach(element => { content = content.replace(element.originalname, element.filename) });
  try {
    var article = await Article.create({ title, content, state })
    var setUser = await article.setUsers(req.user.id);
    var setSection = await article.setSections(section);
    req.files.forEach(async element => {
      var image = await article.createImage({ name: element.filename })
      console.log(image.id)
    })
    return article;
  } catch (error) {
    DeleteImages(req.files)
    throw createError(404, error)
  }
}

//Delete
global.app.delete('/junior/article/:id', global.grantAccess(junior), async (req, res) => {
  var id = req.params.id;
  var Model = await Article.findOne({
    where: { id },
    include: [{
      as: 'users',
      model: User,
      required: true,
      where: { id: req.user.id }
    }]
  })
  if (!Model) {
    throw createError(404);
  }
  var images = await Model.getImages()
  Article.destroy({ where: { id } })
  images.forEach(image => {
    image.path = dest + image.name;
  })
  DeleteImages(images)
  res.json(new global.sendSuccessMsg())
})


// Edit Article
global.app.post('/junior/article/:id', global.grantAccess(junior), upload.array('image', 12), async (req, res) => {
  var id = req.params.id;
  var { content, title, section } = req.body;
  var url = req.protocol + '://' + req.get('host') + '/images';
  try {
    var Entity = { content, title, images: req.files, section }
    var Model = await Article.findOne({ where: { id }, include: [{ model: Image, attributes: ['name', 'id'] }] })
    var deleteImages = []
    var deleteImagesPath = []
    var newImages = []
    Model.images.forEach(image => {
      var check = Entity.content.includes(image.name)
      if (!check) {
        deleteImages.push(image.id)
        deleteImagesPath.push(dest + image.name)
      }
    })
    Entity.images.forEach(async image => {
      var check = Entity.content.includes(image.originalname)
      if (check) {
        var savedImage = await Image.create({ name: image.filename })
        newImages.push(savedImage);
      } else {
        DeleteImages(image);
      }
    })
    //Delete The Replaced Image
    DeleteImages(deleteImagesPath);
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
    article.setSections(Entity.section)
    var sendArticle = await Article.findOne({ where: { id: article.id } })
    res.json(new global.sendData(200, sendArticle))
    if (!article) {
      throw createError(404, 'article not found')
    }
  } catch (error) {
    DeleteImages(req.files);
    throw createError(404, 'somthing went wrong')
  }
})

global.app.get('/junior/articles/search', grantAccess(junior), async (req, res) => {
  var { title, state, section, limit, page } = req.body;
  console.log(req.body)
  var articles = await Article.findAndCountAll({
    include: [
      {
        as: 'sections',
        model: Section,
        required: true,
        where: {
          name: {
            [Op.substring]: section
          }
        }
      }],
    where: {
      title: {
        [Op.substring]: title
      },
      state: {
        [Op.substring]: state
      },
    },
    attributes: {
      exclude: ['content']
    },
    limit: limit || 10,
    offset: page || 0
  })
  res.json(new global.sendData(200, articles))
})
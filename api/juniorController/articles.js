const { Article, Image, User, Section, sequelize } = require('../../mysql');
const { Op } = require("sequelize");


var fs = require('fs');
var { roles, upload, dest, imagesDest } = require('../../conf/default');
var junior = roles.junior;

// Delete Local Images
async function DeleteImages(files) {
  console.log(files);
  if (files) {
    if (Array.isArray(files)) {
      files.forEach(async element => {
        await fs.unlinkSync(element.path || element)
      });
      return true
    } else {
      await fs.unlinkSync(files.path || files)
      return true;
    }
  }
  return true;
}


// GET
global.app.get('/junior/article/:id', global.grantAccess(junior), async (req, res) => {
  var id = req.params.id;
  var article = await Article.findOne({ where: { id } })
  if (article) {
    var images = await article.getImages()
    var url = req.protocol + '://' + req.get('host') + '/images';
    images.forEach(element => {
      article.content = article.content.replace(element.name, url + '/' + element.name);
    });
    article.cover = imagesDest + article.cover;
    res.json(new global.sendData(200, { article }))
  } else {
    throw createError(404);
  }
})



//POST Article
global.app.post('/junior/upload', global.grantAccess(junior), upload.fields([
  { name: 'image', maxCount: 12 },
  { name: 'cover', maxCount: 1 },
]), async (req, res) => {
  var { uploadName } = req.body;
  if (uploadName == 'article') {
    if (req.files) {
      var article = await articleUpload(req);
      res.json(new global.sendData(200, article))
    }
  } else {
    DeleteImages(req.files.image)
    DeleteImages(req.files.cover)
    throw createError(404)
  }
});

async function articleUpload(req) {
  var { content, title, section } = req.body;
  var state = 'pending'
  try {
    var section = await Section.findAll({
      where: { id: section },
      include: [{
        model: User,
        where: {
          id: req.user.id
        }
      }]
    })
    if (!content || !title || section.length === 0 || !req.files.cover[0]) { throw createError(406, 'somthing went wrong') }
    if (req.files.image) req.files.image.forEach(element => { content = content.replace(element.originalname, element.filename) });
    const result = await sequelize.transaction(async (t) => {
      var article = await Article.create({ title, content, state, cover: req.files.cover[0].filename }, { transaction: t })
      var setUser = await article.setUsers(req.user.id, { transaction: t });
      var setSections = await article.setSections(section, { transaction: t });
      await Promise.all(req.files.image.map(async element => {
        var image = await article.createImage({ name: element.filename }, { transaction: t })
      }))
    })
    return result;
  } catch (error) {
    DeleteImages(req.files.image)
    DeleteImages(req.files.cover)
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
  DeleteImages(dest + Model.cover)
  res.json(new global.sendSuccessMsg())
})


// Edit Article
global.app.post('/junior/article/:id', global.grantAccess(junior), upload.fields([
  { name: 'image', maxCount: 12 },
  { name: 'cover', maxCount: 1 },
]), async (req, res) => {
  var id = req.params.id;
  var { content, title, section } = req.body;
  var url = req.protocol + '://' + req.get('host') + '/images';
  try {
    var Entity = { content, title, images: req.files.image, section }
    const result = await sequelize.transaction(async (t) => {
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
          var savedImage = await Image.create({ name: image.filename }, { transaction: t })
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
      var cover = req.files.cover;
      if (cover) {
        Model.cover = cover[0].filename;
      }
      Model.content = Entity.content
      Model.title = Entity.title
      var article = await Model.save({ transaction: t });
      //Delete Images
      Image.destroy({ where: { id: deleteImages } }, { transaction: t })
      //Add Article Images
      article.addImages(newImages, { transaction: t });
      article.setSections(Entity.section, { transaction: t })
      var sendArticle = await Article.findOne({ where: { id: article.id } })
      res.json(new global.sendData(200, sendArticle))
      if (!article) {
        throw createError(404, 'article not found')
      }
    })
  } catch (error) {
    DeleteImages(req.files.image);
    if (cover) {
      DeleteImages(cover[0]);
    }
    throw createError(404, 'somthing went wrong')
  }
})

global.app.post('/junior/articles/search', grantAccess(junior), async (req, res) => {
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
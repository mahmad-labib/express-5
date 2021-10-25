const { Article, Image, User, Section } = require('../../mysql');
const { Op } = require("sequelize");
var fs = require('fs');
var { roles, upload } = require('../../conf/default')
var admin = roles.admin;

const path = require('path')
const { query } = require('express');


//Get Article
global.app.get('/admin/article/:id', async (req, res) => {
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
global.app.post('/upload', global.grantAccess(admin), upload.array('image', 12), async (req, res) => {
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

// POST Article Function
async function articleUpload(req) {
  var { content, title, section, state } = req.body;
  var section = await Section.findOne({ where: { id: section } })
  if (!content || !title || !section || !state) { throw createError(406, 'somthing went wrong') }
  req.files.forEach(element => { content = content.replace(element.originalname, element.filename) });
  var article = await Article.create({ title, content, state });
  if (article) {
    await article.setUsers(req.user.id);
    await article.setSections(section);
    req.files.forEach(async element => {
      await article.createImage({ name: element.filename })
    })
    return article;
  } else {
    DeleteImages(req.files)
    throw createError(404)
  }
}

// Delete Local Images
async function DeleteImages(files) {
  if (Array.isArray(files)) {
    files.forEach(async element => {
      await fs.unlinkSync(element.path || element)
    });
    return true
  } else {
    fs.unlinkSync(element.path || element)
    return true;
  }
}



// Edit Article
global.app.post('/admin/article/:id', global.grantAccess(admin), upload.array('image', 12), async (req, res) => {
  var id = req.params.id;
  var { content, title } = req.body;
  var url = req.protocol + '://' + req.get('host') + '/images';
  try {
    var Entity = { content, title, images: req.files }
    var Model = await Article.findOne({ where: { id }, include: [{ model: Image, attributes: ['name', 'id'] }] })
    var deleteImages = []
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


//Delete
global.app.delete('/admin/article/:id', global.grantAccess(admin), async (req, res) => {
  var id = req.params.id;
  var Model = await Article.findOne({ where: { id } })
  if (!Model) {
    throw createError(404);
  }
  var images = await Model.getImages()
  var article = await Article.destroy({ where: { id } })
  if (images) {
    images.forEach(image => {
      image.path = dest + image.name;
    })
    DeleteImages(images)
  }
  res.json(new global.sendSuccessMsg());
})


//GET ALL
global.app.get('/admin/articles', global.grantAccess(admin), async (req, res) => {
  var { limit, page, order } = req.body;
  var articles = await Article.findAndCountAll({
    where: {
      state: 'approved'
    },
    order: [
      ['createdAt', order],
    ],
    attributes: ['id', 'title'],
    limit: limit,
    offset: page || 0
  })
  res.json(new global.sendData(200, articles))
})

// Search 
global.app.get('/admin/articles/search', global.grantAccess(admin), async (req, res) => {
  var { title, state, section, author, limit, page } = req.body;
  var article = await Article.findAndCountAll({
    include: [{
      as: 'users',
      model: User,
      required: true,
      where: {
        name: {
          [Op.substring]: author
        }
      }
    },
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
    limit: limit,
    offset: page || 0
  })
  res.json(new global.sendData(200, article));
})
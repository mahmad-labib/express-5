const { Article, Image, User, Section } = require('../../mysql');
const { Op } = require("sequelize");
var fs = require('fs');
var { roles, upload } = require('../../conf/default')
var junior = roles.junior;

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
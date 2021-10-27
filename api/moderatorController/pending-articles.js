const { Article, User, Section, Image } = require("../../mysql");
var DeleteImages = require('../../middleware/general')
var { roles, upload } = require('../../conf/default');
const { Op } = require("sequelize");
var { roles } = require('../../conf/default');
const createHttpError = require("http-errors");
var moderator = roles.moderator;
const dest = `./public/images/`;

global.app.get('/moderator/pending_articles/search', global.grantAccess(moderator), async (req, res) => {
    var { title, section, author, page, limit, state } = req.body;
    var article = await Article.findAndCountAll({
        include: [{
            as: 'users',
            model: User,
            required: true,
            where: {
                name: {
                    [Op.substring]: author || ''
                }
            }
        },
        {
            as: 'sections',
            model: Section,
            required: true,
            where: {
                name: {
                    [Op.substring]: section || ''
                }
            }
        }],
        where: {
            title: {
                [Op.substring]: title || ''
            },
            state: {
                [Op.substring]: state || ''
            },
        },
        attributes: {
            exclude: ['content']
        },
        limit: limit || 10,
        offset: page || 0
    })
    res.json(new sendData(200, article));
})


global.app.get('/moderator/pending_article/:id', global.grantAccess(moderator), async (req, res) => {
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


global.app.post('/moderator/pending_article/edit/:id', global.grantAccess(moderator), upload.array('image', 12), async (req, res) => {
    var id = req.params.id;
    var { content, title, section, comment, state } = req.body;
    var url = req.protocol + '://' + req.get('host') + '/images';
    try {
        var Entity = { content, title, images: req.files }
        var Model = await Article.findOne({ where: { id }, include: [{ model: Image, attributes: ['name', 'id'] }, { model: User, attributes: ['id'] }] })
        var Author = Model.users[0];
        var deleteImages = []
        var deleteImagesPath = []
        var newImages = []
        var checkSection = await Author.getSections()
        if (!checkSection) {
            throw createError(404, 'user not allowed to post at this section')
        }
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
        if (content) {
            Model.content = Entity.content
        }
        if (title) {
            Model.title = title
        }
        if (state == 'approved') {
            Model.comment = null
        } else {
            Model.comment = comment
        }
        Model.state = state
        var article = await Model.save();
        //Delete Images
        if (deleteImages.length > 0) {
            await Image.destroy({ where: { id: [deleteImages] } })
        }
        //Add Article Images
        if (newImages.length > 0) {
            article.addImages(newImages);
        }
        if (section) {
            article.setSections(section)
        }
        var sendArticle = await Article.findOne({ where: { id: article.id } })
        res.json(new global.sendData(200, sendArticle))
        if (!article) {
            throw createError(404, 'article not found')
        }
    } catch (error) {
        DeleteImages(req.files);
        throw createError(404, error)
    }
})
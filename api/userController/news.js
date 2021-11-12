const { Op } = require("sequelize");
const { Article, Section, User, sequelize } = require("../../mysql");
var { imagesDest } = require('../../conf/default')

global.app.post('/news', async (req, res) => {
    var { limit, page } = req.body
    var news = await Article.findAndCountAll({
        where: {
            state: 'approved',
        },
        order: [
            ['createdAt', 'DESC']
        ],
        attributes: {
            exclude: ['content', 'state', 'comment', 'updatedAt']
        },
        limit: limit,
        offset: page * limit
    })
    await Promise.all(news.rows.map(async (element) => {
        element.cover = await imagesDest + '/' + element.cover
    }))
    news.count = Math.ceil(news.count / limit);
    res.json(new global.sendData(200, news))
})

global.app.post('/news/search', async (req, res) => {
    var { limit, page, section, author, title } = req.body;
    var news = await Article.findAndCountAll({
        include: [
            {
                as: 'sections',
                model: Section,
                required: true,
                where: {
                    name: {
                        [Op.substring]: section || ''
                    },
                },
            },
            {
                as: 'users',
                model: User,
                required: true,
                where: {
                    name: { [Op.substring]: author || '' },
                },
            }
        ],
        where: {
            title: {
                [Op.substring]: title || ''
            },
            state: 'approved',
        },
        order: [
            ['createdAt', 'DESC']
        ],
        attributes: {
            exclude: ['content', 'state', 'comment', 'updatedAt'],
        },
        limit: limit,
        offset: page * limit,
    })
    await Promise.all(news.rows.map(async (element) => {
        element.cover = await imagesDest + '/' + element.cover
    }))
    news.count = Math.ceil(news.count / limit);
    res.json(new global.sendData(200, news))
})

global.app.get('/news/:id', async (req, res) => {
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


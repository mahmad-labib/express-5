const { Op } = require("sequelize");
const { Article, Section, User, sequelize } = require("../../mysql");

global.app.get('/news', async (req, res) => {
    var { limit, page } = req.body
    if (page < 0) {
        throw createError(404, "please define page");
    }
    var news = await Article.findAll({
        where: {
            state: 'approved',
        },
        order: [
            ['createdAt', 'DESC']
        ],
        attributes: {
            exclude: ['content', 'state', 'comment', 'updatedAt'],
        },
        limit: limit || 20,
        offset: page
    })
    res.json(news)
})

global.app.get('/news/search', async (req, res) => {
    var { limit, page, section, author, title } = req.body;
    if (page < 0) {
        throw createError(404, "please define page");
    }
    var news = await Article.findAll({
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
        limit: limit || 20,
        offset: page
    })
    res.json(new global.sendData(200, news))
})
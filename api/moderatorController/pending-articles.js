const { Article, User, Section } = require("../../mysql");
const { Op } = require("sequelize");
var { roles } = require('../../conf/default');
const createHttpError = require("http-errors");
var moderator = roles.moderator;

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
    if (!article) {
        throw createError(404)
    }
    res.json(new global.sendData(200, article))
})


global.app.post('/moderator/pending_article', global.grantAccess(moderator), async (req, res) => {

})
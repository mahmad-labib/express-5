const { Op } = require("sequelize");
const { Section, User, Favorite, Article } = require("../../mysql");

global.app.get('/favorites/sections', async (req, res) => {
    var { name, limit, page } = req.body;
    var sections = await Section.findAll({
        hierarchy: true,
        name: {
            [Op.substring]: name
        },
        limit: limit || 5,
        offset: page || 0,
    });
    res.json(new global.sendData(200, sections));
})

global.app.get('/favorites/authors', async (req, res) => {
    var { name, limit, page } = req.body;
    var user = await User.findAllAndCount({
        name: {
            [Op.substring]: name
        },
        limit: limit || 5,
        offset: page || 0,
    });
    res.json(new global.sendData(200, user));
})

global.app.post('/favorites/sections', async (req, res) => {
    var { sections } = req.body;
    var user = await User.findOne({ where: { id: req.user.id } })
    await Favorite.destroy({ where: { userId: user.id } })
    sections.forEach(async section => {
        await Favorite.create({ sectionId: section, userId: user.id })
    })
    res.json(new global.sendSuccessMsg())
})

global.app.get('/favorites', async (req, res) => {
    var favorites = await Favorite.findAll({
        where: {
            userId: req.user.id
        },
        attributes: [],
        include: [{
            model: Section,
        }]
    })
    res.json(new global.sendData(200, favorites))
})

global.app.get('/favorites/news', async (req, res) => {
    var { page, limit } = req.body;
    var user = await User.findOne({ where: { id: req.user.id } })
    var favorite_sections = await user.getFavorites({
        attributes: [],
        include: [{
            model: Section,
        }]
    })
    var news = []
    await Promise.all(favorite_sections.map(async (section) => {
        const articles = await section.section.getArticles({
            attributes: ['id', 'title', 'cover'],
            limit,
            offset: page
        })
        news.push({
            section: section.section,
            articles
        })
    }))
    res.json(news)
})


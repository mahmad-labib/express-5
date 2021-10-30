const { Op } = require("sequelize");
const { Section, User, favorites } = require("../../mysql");

global.app.get('/favorites/sections', async (req, res) => {
    var { name, limit, page } = req.body;
    var sections = await Section.findAllAndCount({
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
    await favorites.destroy({ where: { userId: user.id } })
    sections.forEach(async section => {
        await favorites.create({ sectionId: section, userId: user.id })
    })
    res.json(await user.getFavorites())
})
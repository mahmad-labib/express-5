const { User, Role, Article, Section } = require('../../mysql');
const { Op } = require("sequelize");
const { roles } = require('../../conf/default');
var admin = roles.admin

global.app.get('/admin', global.grantAccess(admin), async function (req, res) {
    try {
        var user = await User.findOne({
            where: {
                id: req.user.id
            }
        })
        res.json({
            user
        })
    } catch (error) {
        res.json(new global.Forbidden())
    }
})

global.app.post('/admin/users', global.grantAccess(admin), async function (req, res) {
    var { limit, page } = req.body;
    try {
        var user = await User.findAndCountAll({
            order: [
                ['name', 'ASC'],
            ],
            limit: limit,
            offset: page * limit
        })
        res.json(new global.sendData('202', user))
    } catch (error) {
        res.json(new global.regularError())
    }
})

global.app.post('/admin/users/search', global.grantAccess(admin), async function (req, res) {
    try {
        var { limit, page, name, email, role } = req.body
        var user = await User.findAll({
            where: {
                name: {
                    [Op.substring]: name || ''
                },
                email: {
                    [Op.substring]: email || ''
                }
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'password']
            },
            include: [{
                as: 'roles',
                model: Role,
                required: true,
                where: {
                    name: {
                        [Op.substring]: role || ''
                    }
                }
            }],
            limit: limit ,
            offset: page * limit,
        })
        res.json(new global.sendData('202', user))
    } catch (error) {
        res.json(new global.regularError())
    }
})

global.app.get('/admin/user/:id', global.grantAccess(admin), async function (req, res) {
    try {
        var id = req.params.id;
        var user = await User.findOne({
            where: {
                id
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'password']
            },
            include: [{
                model: Role,
            }, {
                model: Section,
            }],
        })
        res.json(new global.sendData('202', user));
    } catch (error) {
        res.json(new global.regularError(404, 'user not found'))
    }
})

global.app.post('/admin/user', global.grantAccess(admin), async function (req, res) {
    try {
        var { id, name, email } = req.body;
        var user = await User.findOne({
            where: {
                id
            }
        })
        if (!user) {
            res.josn(new global.regularError(404, 'user not found'))
        }
        var query = await User.update({ name, email }, {
            where: {
                id
            }
        })
        res.json(new global.sendSuccessMsg(200, query))
    } catch (error) {
        res.json(new global.regularError())
    }
})

global.app.delete('/admin/user/:id', global.grantAccess(admin), async function (req, res) {
    try {
        var id = req.params.id;
        var query = await User.destroy({
            where: {
                id
            }
        })
        res.json(new global.sendSuccessMsg(200, query))
    } catch (error) {
        res.json(new global.regularError())
    }
})
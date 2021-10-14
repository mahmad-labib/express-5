const {
    User,
    Role
} = require('../../mysql');
const {
    Op
} = require("sequelize");
const crypto = require('crypto');
const {
    roles
} = require('../../conf/default')
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

global.app.get('/admin/users', global.grantAccess(admin), async function (req, res) {
    try {
        var user = await User.findAndCountAll({
            order: [
                ['name', 'ASC'],
            ],
            limit: 5,
            offset: req.body.page
        })
        res.json(new global.sendData('202', user))
    } catch (error) {
        res.json(new global.regularError())
    }
})

global.app.get('/admin/users/search', global.grantAccess(admin), async function (req, res) {
    try {
        var {
            limit,
            page,
            name,
            email
        } = req.body
        var user = await User.findAll({
            where: {
                name: {
                    [Op.substring]: name
                },
                email: {
                    [Op.substring]: email
                }
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'password']
            },
            include: [{
                model: Role,
                attributes: ['id', 'name'],
            }],
            limit: limit,
            offset: page,
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
            }
        })
        res.json(new global.sendData('202', user));
    } catch (error) {
        res.json(new global.regularError(404, 'user not found'))
    }
})

global.app.post('/admin/user', global.grantAccess(admin), async function (req, res) {
    try {
        var {
            id,
            name,
            email
        } = req.body;
        var user = await User.findOne({
            where: {
                id
            }
        })
        if (!user) {
            res.josn(new global.regularError(404, 'user not found'))
        }
        var query = await User.update({
            name,
            email
        }, {
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

global.app.post('/admin/user_roles', global.grantAccess(admin), async function (req, res) {
    try {
        var {
            user_id,
            roles_id
        } = req.body;
        var user = await User.findOne({
            where: {
                id: user_id
            }
        })
        if (roles_id && user) {
            var query = await user.setRoles(roles_id)
            res.json(new global.sendData('202', query));
        }
        res.json(new global.regularError())
    } catch (error) {
        res.json(new global.regularError())
    }
})

global.app.delete('/admin/user_roles', global.grantAccess(admin), async function (req, res) {
    try {
        var {
            user_id,
            roles_id
        } = req.body
        var user = await User.findOne({
            where: {
                id: user_id
            }
        })
        var query = await user.removeRoles(roles_id)
        if (query > 0) {
            res.json(new global.sendSuccessMsg())
        }
        res.json(new global.regularError())
    } catch (error) {
        res.json(new global.regularError())
    }
})

global.app.post('/admin/users_sections', global.grantAccess(admin), async function (req, res) {
    var {
        user_id,
        sections_id
    } = req.body
    var user = await User.findOne({
        where: {
            id: user_id
        }
    })
    var query = await user.setSections(sections_id)
    console.log(query)
    if (!query > 0) {
        res.createError(409)
    }
    res.json(new global.sendSuccessMsg())
})

global.app.delete('/admin/users_sections', global.grantAccess(admin), async function (req, res) {
    var {
        user_id,
        sections_id
    } = req.body
    var user = await User.findOne({
        where: {
            id: user_id
        }
    })
    var query = await user.removeSections(sections_id)
    console.log(query)
    if (!query > 0) {
        res.createError(409)
    }
    res.json(new global.sendSuccessMsg())
})
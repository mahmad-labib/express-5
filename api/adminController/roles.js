const { User, Role } = require('../../mysql');
const { Op } = require("sequelize");
const crypto = require('crypto');
const { roles } = require('../../conf/default');
var admin = roles.admin;

global.app.get('/admin/roles', global.grantAccess(admin), async function (req, res) {
    try {
        var roles = await Role.findAll({
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        })
        res.json(new global.sendData(200, roles))
    } catch (error) {
        res.json(new global.regularError())
    }
})

global.app.get('/admin/role/:id', global.grantAccess(admin), async function (req, res) {
    try {
        var id = req.params.id;
        var role = await Role.findOne({
            where: {
                id
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        })
        res.json(new global.sendData(200, role))
    } catch (error) {
        res.json(new global.regularError())
    }
})

global.app.post('/admin/user_roles', global.grantAccess(admin), async function (req, res) {
    try {
        var { user_id, roles_id } = req.body;
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
        var { user_id, roles_id } = req.body
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

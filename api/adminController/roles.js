const {
    User,
    Role
} = require('../../mysql');
const {
    Op
} = require("sequelize");
const crypto = require('crypto');

global.app.get('/admin/roles', global.grantAccess('admin'), async function (req, res) {
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

global.app.get('/admin/role/:id', global.grantAccess('admin'), async function (req, res) {
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
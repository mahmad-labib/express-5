const { Section } = require('../../mysql');
const { Op } = require("sequelize");
const { roles } = require('../../conf/default');
const { reset } = require('nodemon');
var admin = roles.admin;

global.app.post('/admin/section', global.grantAccess(admin), async (req, res) => {
    var { name, parentId } = req.body;
    var query_check_name = await Section.findOne({ where: { name } })
    if (query_check_name) { throw createError(409) }
    var section = await Section.create({
        name,
        parentId
    })
    res.json(new global.sendSuccessMsg())
})

global.app.get('/admin/sections', global.grantAccess(admin), async (req, res) => {
    var { limit, page } = req.body
    var query = await Section.findAll({
        hierarchy: true,
        limit,
        offset: page
    });
    res.json(new global.sendData(202, query))
})



global.app.get('/admin/section/:id', global.grantAccess(admin), async (req, res) => {
    var id = req.params.id;
    var query = await Section.findOne({
        where: { id },
        include: [{
            model: Section,
            as: 'ancestors'
        }, {
            model: Section,
            as: 'descendents',
            hierarchy: true
        }],
    })
    res.json(new global.sendData(200, query));
})


global.app.delete('/admin/section/:id', global.grantAccess(admin), async (req, res) => {
    var id = req.params.id;
    var query = await Section.findOne({ where: { id } })
    if (query) {
        if (query.parentId && query.children) {
            var parentid = query.parentId
            var childrenQuery = await Section.update({
                parentId: parentid,
            }, {
                where: {
                    parentId: query.id
                }
            })
            query.destroy()
        } else {
            query.destroy()
        }
    } else {
        throw createError(404)
    }
    res.json(new global.sendSuccessMsg());
})

global.app.post('/admin/users_sections', global.grantAccess(admin), async function (req, res) {
    var { user_id, sections_id } = req.body
    var user = await User.findOne({
        where: {
            id: user_id
        }
    })
    var query = await user.setSections(sections_id)
    if (!query > 0) {
        res.createError(409)
    }
    res.json(new global.sendSuccessMsg())
})

global.app.delete('/admin/users_sections', global.grantAccess(admin), async function (req, res) {
    var { user_id, sections_id } = req.body
    var user = await User.findOne({
        where: {
            id: user_id
        }
    })
    var query = await user.removeSections(sections_id)
    if (!query > 0) {
        res.createError(409)
    }
    res.json(new global.sendSuccessMsg())
})
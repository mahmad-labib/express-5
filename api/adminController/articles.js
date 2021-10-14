const {
    User,
    Role,
    Article,
    Section
} = require('../../mysql');

var {
    roles
} = require('../../conf/default')
var admin = roles.admin;

global.app.post('/admin/article', global.grantAccess(admin), async (req, res) => {
    var {
        title,
        content,
    } = req.body;
    console.log(req.file);
    // images.forEach(image=>{
    //     console.log(image.basename) 
    // })
    // var query = Article.create({title, content})
    res.json('s')
})
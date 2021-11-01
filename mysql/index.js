const Sequelize = require('sequelize');
require('sequelize-hierarchy')(Sequelize);
const userModel = require('./models/user-model');
const articleModel = require('./models/article-model');
const imagesModel = require('./models/images-model');
const roleModel = require('./models/role-model');
const sectionModel = require('./models/section-model');
const { conf } = require('../conf/default');
const crypto = require('crypto');

// var cls = require('continuation-local-storage'),
//     namespace = cls.createNamespace('my-very-own-namespace');
// Sequelize.cls = namespace;

// Option 1: Passing a connection URI
const sequelize = new Sequelize(conf.database.DATABASE,
    conf.database.USERNAME,
    conf.database.PASSWORD, {
    host: conf.database.HOST,
    dialect: 'mysql'
});

try {
    sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

//  USE MODELS
const User = userModel(sequelize, Sequelize);
const Role = roleModel(sequelize, Sequelize);
const Image = imagesModel(sequelize, Sequelize);
const Article = articleModel(sequelize, Sequelize);
const Section = sectionModel(sequelize, Sequelize);



//   ------Pivot Tables------

//   Users_Roles
const users_roles = sequelize.define('users_roles');

// Users_Sections
const users_sections = sequelize.define('users_sections')

//Users_Articles
const users_articles = sequelize.define('users_articles')


// Articles_Sections
const articles_sections = sequelize.define('articles_sections')

// Favorites
const Favorite = sequelize.define('favorites')


//  ------ Relations ------

// Users_Roles Relation
User.belongsToMany(Role, {
    hooks: true,
    onDelete: 'cascade',
    through: users_roles,
});
Role.belongsToMany(User, {
    hooks: true,
    onDelete: 'cascade',
    through: users_roles,
});

// Users_Sections Relation
User.belongsToMany(Section, {
    hooks: true,
    onDelete: 'cascade',
    through: users_sections
})
Section.belongsToMany(User, {
    hooks: true,
    onDelete: 'cascade',
    through: users_sections
})

// Users_Favorites Relation
User.hasMany(Favorite);
Favorite.belongsTo(User);
Section.hasMany(Favorite);
Favorite.belongsTo(Section);

// Articles_Sections Relation
Article.belongsToMany(Section, {
    hooks: true,
    onDelete: 'cascade',
    through: articles_sections
})
Section.belongsToMany(Article, {
    hooks: true,
    onDelete: 'cascade',
    through: articles_sections
})

// Users_Articles Relation
User.belongsToMany(Article, {
    hooks: true,
    onDelete: 'cascade',
    onUpdate: 'cascade',
    through: users_articles
})
Article.belongsToMany(User, {
    hooks: true,
    onDelete: 'cascade',
    onUpdate: 'cascade',
    through: users_articles
})

// Article_Images Relation
Article.hasMany(Image, {
    hooks: true,
    onDelete: 'cascade',
})
Image.belongsTo(Article, {
    hooks: true,
    onDelete: 'cascade',
})


// through is required!
try {
    // sequelize.sync({ force: true }).then(async function () {
    //     Role.bulkCreate([
    //         { name: 'admin' }, // part of records argument
    //         { name: 'moderator' },
    //         { name: 'junior' }
    //     ]);
    //     Section.bulkCreate([
    //         { name: 'sport' }
    //     ]);
    //     var hash = crypto.pbkdf2Sync('admin', 'salt', 100, 24, 'sha512').toString('hex');
    //     var admin = await User.create(
    //         { name: 'admin', password: hash, email: 'test@gmail.com' }
    //     )
    //     var adminRoles = await Role.findAll()
    //     await admin.setRoles(adminRoles)
    // })
} catch (err) {
    console.log(err);
}

module.exports = {
    User,
    Role,
    Section,
    Article,
    Image,
    sequelize,
    Favorite
}
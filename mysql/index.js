const Sequelize = require('sequelize');
require('sequelize-hierarchy')(Sequelize);
const userModel = require('./models/user-model');
const articleModel = require('./models/article-model');
const imagesModel = require('./models/images-model');
const pArticleModel = require('./models/pending-articles');
const roleModel = require('./models/role-model');
const sectionModel = require('./models/section-model');
const pImagesModel = require('./models/pending-images');
const {
    conf
} = require('../conf/default');


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
const pArticle = pArticleModel(sequelize, Sequelize);
const pImage = pImagesModel(sequelize, Sequelize);
const Section = sectionModel(sequelize, Sequelize);



//   ------Pivot Tables------

//   Users_Roles
const users_roles = sequelize.define('users_roles');

// Users_Sections
const users_sections = sequelize.define('users_sections')

//Users_Articles
const users_articles = sequelize.define('users_articles')

// Users_Pending_Articles
const users_pending_articles = sequelize.define('users_pending_articles')

// Articles_Sections
const articles_sections = sequelize.define('articles_sections')

// Pending_Articles_Images
const p_articles_images = sequelize.define('p_articles_images')

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

// Users_Pending_Article Relation
User.belongsToMany(pArticle, {

    hooks: true,
    onDelete: 'cascade',
    through: users_pending_articles
})
pArticle.belongsToMany(User, {

    hooks: true,
    onDelete: 'cascade',
    through: users_pending_articles
})

// Pending_Articles_Images Relation
pImage.belongsToMany(pArticle, {
    hooks: true,
    onDelete: 'cascade',
    through: p_articles_images
})
pArticle.belongsToMany(pImage, {
    hooks: true,
    onDelete: 'cascade',
    through: p_articles_images
})

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
    through: users_articles
})
Article.belongsToMany(User, {
    hooks: true,
    onDelete: 'cascade',
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
    // sequelize.sync().then(function(){
    //     Role.bulkCreate([
    //         {name: 'admin'}, // part of records argument
    //         {name: 'moderator'},
    //         {name: 'junior'}
    //     ]);
    // });
    // sequelize.sync({
    //     force: true
    // });
} catch (err) {
    console.log(err);
}

module.exports = {
    User,
    Role,
    Section,
    Article,
    Image
}
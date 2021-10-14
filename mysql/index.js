const Sequelize = require('sequelize');
require('sequelize-hierarchy')(Sequelize);
const userModel = require('./models/user-model');
const articleModel = require('./models/article-model');
const imagesModel = require('./models/images-model');
const pArticleModel = require('./models/pending-articles');
const roleModel = require('./models/role-model');
const sectionModel = require('./models/section-model');
const pImagesModel = require('./models/pending-images');
const {conf} = require('../conf/default');


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

// Articles_Images
const articles_images = sequelize.define('articles_images')

// Pending_Articles_Images
const p_articles_images = sequelize.define('p_articles_images')

//  ------ Relations ------

// Users_Roles Relation
User.belongsToMany(Role, {
    through: users_roles,
});
Role.belongsToMany(User, {
    through: users_roles,
});

// Users_Sections Relation
User.belongsToMany(Section, {
    through: users_sections
})
Section.belongsToMany(User, {
    through: users_sections
})

// Users_Pending_Article Relation
User.belongsToMany(pArticle, {
    through: users_pending_articles
})
pArticle.belongsToMany(User, {
    through: users_pending_articles
})

// Pending_Articles_Images Relation
pImage.belongsToMany(pArticle, {
    through: p_articles_images
})
pArticle.belongsToMany(pImage, {
    through: p_articles_images
})

// Articles_Sections Relation
Article.belongsToMany(Section, {
    through: articles_sections
})
Section.belongsToMany(Article, {
    through: articles_sections
})

// Users_Articles Relation
User.belongsToMany(Article, {
    through: users_articles
})
Article.belongsToMany(User, {
    through: users_articles
})

// Article_Images Relation
Article.belongsToMany(Image, {
    through: articles_images
})
Image.belongsToMany(Article, {
    through: articles_images
})


// through is required!
try {
    // sequelize.sync();
} catch (err) {
    console.log(err);
}

module.exports = {
    User,
    Role,
    Section,
    Article
}
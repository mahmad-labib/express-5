module.exports = (sequelize, type) => {

    return sequelize.define('articles', {
        // Model attributes are defined here
        title: {
            type: type.STRING,
            allowNull: false,
            unique: true
        },
        content: {
            type: type.TEXT,
            allowNull: false
        },
        state: {
            type: type.STRING(15),
            allowNull: false
        },
        comment: {
            type: type.STRING,
            allowNull: true
        },
        cover: {
            type: type.TEXT,
            allowNull: false
        }
    }, {
        modelName: 'articles'
    });

}
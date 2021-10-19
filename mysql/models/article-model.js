module.exports = (sequelize, type) => {

    return sequelize.define('articles', {
        // Model attributes are defined here
        title: {
            type: type.STRING,
            allowNull: false
        },
        content: {
            type: type.STRING(2000),
            allowNull: false
        },
        state: {
            type: type.STRING(15),
            allowNull: false
        },
        comment: {
            type: type.STRING,
            allowNull: true
        }
    }, {
        modelName: 'articles'
    });
    
    }
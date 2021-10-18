module.exports = (sequelize, type) => {

    return sequelize.define('images', {
        // Model attributes are defined here
        name: {
            type: type.STRING,
            allowNull: false
        }
    }, {
        modelName: 'images'
    });
    
    }
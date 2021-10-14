module.exports = (sequelize, type) => {

    return sequelize.define('p_Articles', {
        // Model attributes are defined here
        title: {
            type: type.STRING,
            allowNull: false
        },
        content: {
            type: type.STRING,
            allowNull: false
        },
    }, {
        modelName: 'p_Articles'
    });
    
    }
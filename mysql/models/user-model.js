  module.exports = (sequelize, type) => {
    return sequelize.define('users', {
        // Model attributes are defined here
        name: {
            type: type.STRING,
            allowNull: false
        },
        email: {
            type: type.STRING,
            allowNull: false
        },
        password: {
            type: type.STRING,
            allowNull: false
        },
    }, {
        modelName: 'users'
    });
}
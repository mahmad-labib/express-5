  module.exports = (sequelize, type) => {
    return sequelize.define('users', {
        // Model attributes are defined here
        name: {
            type: type.STRING,
            allowNull: false
        },
        email: {
            type: type.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: type.STRING,
            allowNull: false
        },
    }, {
        modelName: 'users'
    });
}
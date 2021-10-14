module.exports = (sequelize, type) => {

return sequelize.define('roles', {
    // Model attributes are defined here
    name: {
        type: type.STRING,
        allowNull: false
    },
}, {
    modelName: 'roles'
});

}
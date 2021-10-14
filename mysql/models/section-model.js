module.exports = (sequelize, type) => {

    return sequelize.define('sections', {
        // Model attributes are defined here
        name: {
            type: type.STRING,
            allowNull: false
        },
    }, {
        hierarchy: true
    }, {
        modelName: 'sections'
    });

}
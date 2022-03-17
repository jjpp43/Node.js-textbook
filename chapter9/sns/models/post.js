const Sequelize = require('sequelize');

/**
 * 
 */
module.exports = class Hashtag extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            content: {
                type: Sequelize.STRING(140),
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Post',
            tableName: 'posts',
            paranoid: false,
            charset: 'utf9mb4',
            collate: 'utf8mb4_general_ci'
        });
    }

    static associate(db) {
        db.Post.belongTo(db.User);
        db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });
    }
};
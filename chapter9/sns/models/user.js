const Sequelize = require('sequelize');
/**
 * 사용자 정보를 저장하는 모델
 * sns 로그인을 했을 때 provider 와 snsId를 저장한다.
 * provider : local, kakao등등,,,
 * 
 * user 모델과 post 모델은 1:N 관계에 있으므로 hasMany로 연결되어 있음.
 */

module.exports = class User extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            email: {
                type: Sequelize.STRING(40),
                allowNull: true,
                unique: true
            },
            nick: {
                type: Sequelize.STRING(15),
                allowNull: false
            },
            password: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            provider: {
                type: Sequelize.STRING(10),
                allowNull: false,
                defaultValue: 'local'
            },
            snsId: {
                type: Sequelize.STRING(30),
                allowNull: true
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: true,
            charser: 'utf-8',
            collate: 'utf8_general_ci',
        });
    }
    static associate(db) {
        db.User.hasMany(db.Post);
        db.User.belongsToMany(db.User, {
            foreignKey: 'followingId',
            as: 'Followers',
            through: 'Follow',
        });
        db.User.belonsToMany(db.User, {
            foreignKey: 'followerId',
            as: 'Followings',
            through: 'Follow',
        });
    }
};


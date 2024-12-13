const { DataTypes } = require("sequelize");
const { sequelize } = require("../db.js");

const User = sequelize.define("user", {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    refreshtoken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: "users",
    timestamps: true, 
});

module.exports = User;

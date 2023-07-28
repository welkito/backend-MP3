import db from "./index.js";

export const User = db.sequelize.define("user", {
    id : {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username : {
        type : db.Sequelize.STRING,
        allowNull : false
    },
    email : {
        type : db.Sequelize.STRING,
        allowNull : false
    },
    password : {
        type : db.Sequelize.STRING,
        allowNull : false
    },
    status : {
        type : db.Sequelize.INTEGER,
        allowNull : false,
        defaultValue : 1
    },
    role : {
        type : db.Sequelize.INTEGER,
        allowNull : false,
        defaultValue : 1
    },
    profileURL : {
        type : db.Sequelize.STRING,
        allowNull : true
    },
},{
  timestamps: false
});
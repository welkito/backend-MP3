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
    storename : {
        type : db.Sequelize.STRING,
        allowNull : true
    },
    password : {
        type : db.Sequelize.STRING,
        allowNull : false
    },
    status : {
        type : db.Sequelize.INTEGER,
        allowNull : false
    },
    role : {
        type : db.Sequelize.INTEGER,
        allowNull : false
    },
    profileURL : {
        type : db.Sequelize.STRING,
        allowNull : true
    },
},{
  timestamps: false
});
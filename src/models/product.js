import db from "./index.js";

export const Category = db.sequelize.define("category", {
    id : {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name : {
        type : db.Sequelize.STRING,
        allowNull : false
    },
    status : {
        type : db.Sequelize.BOOLEAN,
        allowNull : false,
        defaultValue : true
    }

},{
    timestamps : false
})


export const Product = db.sequelize.define("product",{
    id : {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name : {
        type : db.Sequelize.STRING,
        allowNull : false
    },
    description : {
        type : db.Sequelize.STRING
    },
    price : {
        type : db.Sequelize.STRING,
        allowNull : false
    },
    image : {
        type : db.Sequelize.STRING,
    },
   status : {
        type : db.Sequelize.BOOLEAN,
        allowNull : false,
        defaultValue : true
    }
   
},{
    timestamps: false
})

export const Product_Category = db.sequelize.define("product_category",{
    id : {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

},{
    timestamps : false
})
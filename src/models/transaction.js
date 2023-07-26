import db from "./index.js";



export const Transaction = db.sequelize.define("transaction", {
    id : {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    invoice : {
        type : db.Sequelize.STRING,
        allowNull : true,
        defaultValue : null
    },
    date : {
        type : db.Sequelize.DATE,
        allowNull : false
    },
    cashierId : {
        type : db.Sequelize.INTEGER,
        allowNull : false
    }
    ,
    paymentTypeId : {
        type : db.Sequelize.INTEGER,
        allowNull : false
    }
    //cashierId, paymentTypeId
},{
  timestamps: true,
  createdAt: 'date',
  updatedAt: false
});

export const Order = db.sequelize.define("order", {
    id : {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    quantity : {
        type : db.Sequelize.INTEGER,
        allowNull : false
    },
    totalPrice : {
        type : db.Sequelize.INTEGER,
        allowNull : false
    },
    transactionId : {
        type : db.Sequelize.INTEGER,
        allowNull : false
    },
    orderProductId : {
        type : db.Sequelize.INTEGER,
        allowNull : false
    }
     //transactionId,orderProductId, 
},{
    timestamps: false
});

export const Payment = db.sequelize.define("payment", {
    id : {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name : {
        type : db.Sequelize.STRING,
        allowNull : false
    },
},{
    timestamps: false
});
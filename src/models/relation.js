
import { Category,Product,Product_Category} from "./product.js"
import { User } from "./user.js"
import { Transaction,Order,Payment } from "./transaction.js"
// @define relation

//1 cat bs punya banyak prod_cat
Category.hasMany(Product_Category)
Product_Category.belongsTo(Category, {as : "category"})//, { foreignKey : "idCategory" }
//1 prod bs punya banyak prod_cat
Product.hasMany(Product_Category)
Product_Category.belongsTo(Product, {as : "product"})//, { foreignKey : "idUser" }

//1 cat bs punya 1 parent node
Category.hasOne(Category,{foreignKey: {
    allowNull: true
},as : "parent"})

  User.hasMany(Transaction,{sourceKey : "id", foreignKey : "cashierId" })
  Transaction.belongsTo(User, {targetKey : "id", foreignKey : "cashierId"})//{foreignKey : {name : "cashierId"}}

Payment.hasMany(Transaction, {sourceKey : "id", foreignKey : "paymentTypeId"})
Transaction.belongsTo(Payment, {sourceKey : "id", foreignKey : "paymentTypeId"})

//cara 1
// Transaction.hasMany(Order, {foreignKey : {name : "transactionId"}})
// Order.belongsTo(Transaction, {foreignKey : {name : "id"}})

// Product.hasMany(Order, {foreignKey : {name : "orderProductId"}})
// Order.belongsTo(Product, {foreignKey : {name : "id"}})

//cara 2
// Transaction.belongsToMany(Product, {through: "orders", as : "products", foreignKey :"transactionId"})
// Product.hasMany(Order, {foreignKey : "orderProductId"})
// Order.belongsTo(Product, {foreignKey : "id"})
// Product.belongsToMany(Transaction, {through : "orders", as : "transactions", foreignKey :"orderProductId"})

//order = transaction detail

Transaction.hasMany(Order,{foreignKey : "transactionId"})
Product.hasMany(Order, {sourceKey : "id", foreignKey : "orderProductId"})
Order.belongsTo(Product, {targetKey : "id", foreignKey :"orderProductId"})
//This creates a foreign key called `captainName` in the source model (Ship)
// which references the `name` field from the target model (Captain).


export {  Category, Product, Product_Category, User, Payment, Transaction, Order }


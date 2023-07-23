
import { Category,Product,Product_Category} from "./product.js"

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


export {  Category, Product, Product_Category }


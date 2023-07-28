import { ValidationError } from "yup"
import { Order,Transaction,Product,Payment, Product_Category, Category, User} from "../../models/relation.js"
import { Sequelize, Op ,QueryTypes} from "sequelize"
import db from "../../models/index.js"
import { USER_ALREADY_EXISTS, USER_DOES_NOT_EXISTS, INVALID_CREDENTIALS } from "../../middlewares/error.handler.js"
// import { productValidationSchema,categoryValidationSchema, updateProductValidationSchema, updateCategoryValidationSchema } from "./validation.js"
import { deleteImage } from "../../helpers/uploader.js"
import fs from "fs"
import path from "path"
import { ReportValidationSchema} from "./validation.js"

const orderQuery = {
    model : Order,
    include : {
        model : Product,
        include : {
            model : Product_Category,
            include : {
                model : Category,
                attributes: { exclude: ['status',"parentId"]}
            },
            attributes: { exclude: ['productId','categoryId']}
        },
        attributes: { exclude: ['image','description',"status"]}
    },
    attributes: { exclude: ['transactionId','orderProductId']}
}

async function allTransactionDetails(dateFrom, dateTo){
    return await Transaction?.findAll({
        where: {
            date: {
                [Op.lt]: new Date(dateTo),
                [Op.gt]: new Date(dateFrom)
              }
          }
        ,
        include : 
        [
            {
                model : Payment
            },
            {
                model : User,
                attributes : {
                    exclude : ["email","storename","password","status","role","profileURL"]
                }
            },
            orderQuery
        ],
        attributes: { exclude: ["cashierId","paymentTypeId"]}
    });
}

async function topProduct (dateFrom, dateTo){
    return await db.sequelize.query(`
    select products.name, sum(orders.quantity) as total_item from orders 
    join transactions on transactions.id = orders.transactionId 
    join products on products.id = orders.orderProductId
    where transactions.date >= CAST("${dateFrom}" AS DATE)
    AND transactions.date <= CAST("${dateTo}" AS DATE) 
    group by orders.orderProductId order by total_item desc limit 0,5;                           
    `,{
        type: QueryTypes.SELECT
    })
}

async function totalSales (dateFrom, dateTo){
    return await db.sequelize.query(`
    select sum(orders.quantity) as totalSales, sum(orders.totalPrice) as totalRevenue from orders 
    join transactions on transactions.id = orders.transactionId
    where transactions.date >= CAST("${dateFrom}" AS DATE)
    AND transactions.date <= CAST("${dateTo}" AS DATE);                            
    `,{
        type: QueryTypes.SELECT
    })
    }

async function salesByDate (dateFrom, dateTo){
    return await db.sequelize.query(`
    select cast(transactions.date AS DATE) as date, sum(orders.quantity) as totalSales,
    sum(orders.totalPrice) as totalRevenue from orders 
    join transactions on transactions.id = orders.transactionId
    where transactions.date > CAST("${(dateFrom)}" AS DATE)
    AND transactions.date <= CAST("${(dateTo)}" AS DATE) group by cast(transactions.date AS DATE);                            
    `,{
        type: QueryTypes.SELECT
    })
    }

function dateHandler(formattedDate){
    const currentDate = new Date(formattedDate)
    currentDate.setDate(currentDate.getDate() + 1)
    const yyyy = currentDate.getFullYear();

    let mm = currentDate.getMonth() + 1; 
    let dd = currentDate.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    return yyyy + "-" + mm + '-' + dd;
}

export const createReport = async(req,res,next) =>{
    try{
        // @create transaction
        const transaction = await db.sequelize.transaction(async()=>{
            //ambil data
            const {dateFrom, dateTo} = req.body
            //validate input
            await ReportValidationSchema.validate(req.body)
            const newDateTo = dateHandler(dateTo);
            //query untuk total sales dan total revenue per hari
            const sales = await salesByDate(dateFrom, newDateTo);
            //query untuk cari 5 product, lalu tampilkan detailsnya
            const topProducts = await topProduct(dateFrom, newDateTo);
            //query untuk count total sales dan total revenue
            const total = await totalSales(dateFrom, newDateTo);
            //query untuk detail tiap transaksi
            const details = await allTransactionDetails(dateFrom, newDateTo);
            //send response
            res.status(200).json({
                message : `Report from ${dateFrom} to ${dateTo}`,
                graphic : sales,
                bestSeller : topProducts,
                summary : total,
                data : details
            })
        });
    }
    catch(error){        
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

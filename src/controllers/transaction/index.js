import { ValidationError } from "yup"
import { Order,Transaction,Product,Payment, User} from "../../models/relation.js"
import { Sequelize, Op ,QueryTypes} from "sequelize"
import db from "../../models/index.js"
import { USER_ALREADY_EXISTS, USER_DOES_NOT_EXISTS, INVALID_CREDENTIALS } from "../../middlewares/error.handler.js"
// import { productValidationSchema,categoryValidationSchema, updateProductValidationSchema, updateCategoryValidationSchema } from "./validation.js"
import { deleteImage } from "../../helpers/uploader.js"
import fs from "fs"
import path from "path"
//buat transaction detail 

//update transactions, update order sesuai transaction detail, terus send requet
function invoice (id) {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = dd + '' + mm + '' + yyyy;
    return ("INV" + formattedToday + "-" + id)
} 

export const createTransaction = async(req,res,next) =>{
    try{
        // @create transaction
        const transaction = await db.sequelize.transaction(async()=>{
            //ambil data
            const {id,paymentTypeId,details} = req.body
            //validate input

            //bikin transaction
            const transactionData = await Transaction.create({
                cashierId : id,
                paymentTypeId : paymentTypeId
            })
            console.log(transactionData?.dataValues)
            await Transaction.update({invoice : invoice(transactionData?.dataValues?.id)},
            {where :{ id : transactionData?.dataValues?.id}})
            
            //loop sesuai panjang details
            for (let i = 0; i < details.length; i++) {
                //ambil data product, buat dapetin price
                const productData = await Product.findOne({where : {"id" : details[i]?.orderProductId}})
                //create order
                await Order.create({
                    transactionId : transactionData?.dataValues?.id,
                    orderProductId : details[i]?.orderProductId,
                    quantity : details[i]?.quantity,
                    price : productData?.dataValues?.price,
                    totalPrice : +details[i]?.quantity * +productData?.dataValues?.price
                })       
            }
            //return transaction
            //result nomor id transactionnya sama message
            res.status(200).json({
                message : "Transaction created",
                id : transactionData?.dataValues?.id

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
export const showTransaction = async(req,res,next) =>{
    try{
        // @show transaction
        const transaction = await db.sequelize.transaction(async()=>{          
        
            //ambil data transaction based on id
            const transactionData = await Transaction.findOne({where : {"id" : req?.params?.id}
            ,
            include : User
        }
            )
            //cari smua data orders based on transaction id
            const result = await Order.findAll({where : {"transactionId" : req?.params?.id}, 
            include : Product
               
              })
            //return data orders, sm transactionnya
            res.status(200).json({
                message : "Transaction data",
                transaction : transactionData,
                details : result
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

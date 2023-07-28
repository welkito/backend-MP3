import { ValidationError } from "yup"
import {Product,Product_Category,Category} from "../../models/relation.js"
import { Sequelize, Op ,QueryTypes} from "sequelize"
import db from "../../models/index.js"
import { productValidationSchema,categoryValidationSchema, updateProductValidationSchema, updateCategoryValidationSchema } from "./validation.js"
import { deleteImage } from "../../helpers/uploader.js"
import fs from "fs"
import path from "path"
import { url } from "inspector"


//should be done
//deactivate product (cukup bikin status product jadi dari 1 jadi 0)
export const deleteProduct= async(req,res,next) =>{
    try{
        const { id } = req.params;
        // @create transaction
        const transaction = await db.sequelize.transaction(async()=>{          
        //update product data on sql server
        await Product?.update({ status : 0},{
            where: {
              id: id
            }
          });
        res.status(200).json({message : "Delete product succeed"})
        });
    }
    catch(error){
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

//should be done
//deactivate category (soft delete/status disabled)
export const deleteCategory= async(req,res,next) =>{
    try{
        const { id } = req.params;
        console.log(id)
        // @create transaction
        const transaction = await db.sequelize.transaction(async()=>{          
        //update category data on sql server
        await Category?.update({ status : 0},{
            where: {
              id: id
            }
          });

        res.status(200).json({message : "Delete category succeed"})
        });
    }
    catch(error){
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}





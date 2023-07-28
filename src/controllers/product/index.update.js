import { ValidationError } from "yup"
import {Product,Product_Category,Category} from "../../models/relation.js"
import { Sequelize, Op ,QueryTypes} from "sequelize"
import db from "../../models/index.js"
import { productValidationSchema,categoryValidationSchema, updateProductValidationSchema, updateCategoryValidationSchema } from "./validation.js"
import { deleteImage } from "../../helpers/uploader.js"
import fs from "fs"
import path from "path"
import { url } from "inspector"


//update product pake formdata lagi biar sekali kerja ;)
export const updateProduct= async(req,res,next) =>{
    try{
        // @create transaction
        const transaction = await db.sequelize.transaction(async()=>{          
        //@extract JSON form data and parse it
        const { data } = req.body;
        const newProduct= JSON.parse(data);
        //validation
        await updateProductValidationSchema.validate(newProduct);
        //if image attachment is true
        if(req?.file?.path){
            // @get current product data
            const current = await Product?.findOne({where : { id: newProduct?.id}});
            //code for gettin public_id
            const deString = current.image.split("Public")[1]
            const image  = "Public"+deString.split(".")[0]
            //delete image product on cloudinary
            await deleteImage(image)
        }
        //update product data on sql server
        await Product?.update({
            name: newProduct?.name,
            description : newProduct?.description,
            price : newProduct?.price,
            image : req?.file?.path,
        },{
            where: {
              id: newProduct?.id
            }
          });
          //send response
          res.status(200).json({message : "Product updated successfully"});
        });
    }
    catch(error){
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

//edit category
export const updateCategory= async(req,res,next) =>{
    try{
        // @create transaction
        const transaction = await db.sequelize.transaction(async()=>{          
            //validation
            await updateCategoryValidationSchema.validate(req?.body);
            //update category data on sql server
            await Category?.update({
                name: req?.body?.name,
                parentId : req?.body?.parentId
            },{
                where: {
                  id: req?.body?.id
                }
              });
              //send response
              res.status(200).json({message : "category updated successfully"});
            });
    }
    catch(error){
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}




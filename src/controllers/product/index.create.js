import { ValidationError } from "yup"
import {Product,Product_Category,Category} from "../../models/relation.js"
import { Sequelize, Op ,QueryTypes} from "sequelize"
import db from "../../models/index.js"
import { productValidationSchema,categoryValidationSchema, updateProductValidationSchema, updateCategoryValidationSchema } from "./validation.js"
import { deleteImage } from "../../helpers/uploader.js"
import fs from "fs"
import path from "path"
import { url } from "inspector"

async function allCatIds(options) {
    return await db.sequelize.query(`
            with recursive cte (id, name, parentId, status) as (
                select     id,
                           name,
                           parentId,
                           status
                from       categories
                where      id = ${options}
                union all
                select     c.id,
                           c.name,
                           c.parentId,
                           c.status
                from       categories c
                inner join cte
                        on c.id = cte.parentId
              )
              select id from cte where status = 1;                        
           `,{
            type: QueryTypes.SELECT
        })
}

//create product ( name, iamge, price, category, description ) pake formdata
export const addProduct= async(req,res,next) =>{
    try{
        // @create transaction
        const transaction = await db.sequelize.transaction(async()=>{          
        //@extract JSON formdata and parse it
        const { data } = req.body;
        const newProduct= JSON.parse(data);
        //validation
        await productValidationSchema.validate(newProduct);
        //create into db
        const result = await Product?.create({
            name: newProduct?.name,
            description : newProduct?.description,
            price : newProduct?.price,
            image : req?.file?.path,
        });
        //cari id + parent idnya yang berhubungan dengan category id yg dikirim
        const allCatId = await allCatIds(newProduct?.categoryId)
        //bikin loop
        for(var i = 0; i < allCatId.length; i++){
            //create ke table 
            await Product_Category?.create({
                productId : result?.dataValues?.id,
                categoryId : allCatId[i].id,
            })
        }
        //send result
        res.status(200).json({message: "Successfully add new product.", result: result})
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
//+ add category
export const addCategory= async(req,res,next) =>{
    try{
    // @create transaction
        const transaction = await db.sequelize.transaction(async()=>{          
        //@extract JSON formdata and parse it
        const newCategory = req.body;
        //validation
        await categoryValidationSchema.validate(newCategory);
        //create into db
        const result = await Category?.create({
            name: newCategory?.name,
            parentId : newCategory?.parentId,
        });
        //send result
        res.status(200).json({message: "Successfully add new category", result: result})
    });
    }
    catch(error){
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}






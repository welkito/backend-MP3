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
function allProductQuery (category){
   return [
       Sequelize.literal(`(
        select productId 
        from product_categories as product_category where product_category.categoryId = ${category}                        
       )`)
   ]                   
}

const productIncludeQuery = {
    model : Product_Category,
    include : {
        model : Category,
        where : {status : 1},
        attributes: { exclude: ['status',"parentId"] }
    },
    attributes: { exclude: ['productId','categoryId'] }
}

async function totalQuery(cat_id, allProductId, word){
    return await Product?.count({
        where: {
            id : cat_id ? allProductId : 
           {[Op.not] : null},
           name : {
                  [Op.like] : [`%${word}%`]
          },
          status : 1
        }
    });
}

async function productQuery(cat_id, allProductId, word, query, opt){
    return await Product?.findAll({
        where: {
            id : cat_id ? allProductId : 
        {[Op.not] : null},
        name : {
                [Op.like] : [`%${word}%`]
        },
        status : 1
        },
        include : [query],
    ...opt,
    attributes: { exclude: ["status"]}
    });
}

//untuk tampilin semua produk 
export const showProduct = async(req,res,next) =>{
    try{
        const {cat_id, word, page, sortLetter, sortPrice } = req.query;
        //queries depends
        const limit = 10;
        const sort = []
        sort.push(["price",sortPrice],["name",sortLetter])
        const opt = {
            offset: page - 1 > 0 ? parseInt(page - 1) * parseInt(limit) : 0,
            limit: limit, 
            order:sort
        }
        //get all products with sort,filter,and pagination
        const  allProductId = {[Op.in] : allProductQuery(cat_id)}
        const product = await productQuery(cat_id, allProductId, word, productIncludeQuery, opt)
        // @get total blog, according to the blog query
        const total = await totalQuery(cat_id, allProductId, word);
        // @get total pages
        const pages = Math.ceil(total / opt.limit);
        //pagination
        res.status(200).json({
            message : "All Product data",
            currentPage : page,
            totalPage : pages,
            result : product
        })
    }
    catch(error){
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

//untuk tampilin show kategorinya
export const showCategory = async(req,res,next) =>{
    try{
        const cat= await Category?.findAll({where : {status : 1}});
        res.status(200).json({category : cat})
    }
    catch(error){
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}




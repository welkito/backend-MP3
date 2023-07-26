import { ValidationError } from "yup"
import {Product,Product_Category,Category} from "../../models/relation.js"
import { Sequelize, Op ,QueryTypes} from "sequelize"
import db from "../../models/index.js"
import { USER_ALREADY_EXISTS, USER_DOES_NOT_EXISTS, INVALID_CREDENTIALS } from "../../middlewares/error.handler.js"
import { productValidationSchema,categoryValidationSchema, updateProductValidationSchema, updateCategoryValidationSchema } from "./validation.js"
import { deleteImage } from "../../helpers/uploader.js"
import fs from "fs"
import path from "path"
import { url } from "inspector"

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
        const allCatId = await db.sequelize.query(`
            with recursive cte (id, name, parentId, status) as (
                select     id,
                           name,
                           parentId,
                           status
                from       categories
                where      id = ${newProduct?.categoryId}
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

//should be done
//show product(mirip showallblog)
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
        //constraint if categoryid status = 0
        
        //get all products with sort,filter,and pagination
        const  allProductId = {
            [Op.in] :  [
               Sequelize.literal(`(
                select productId 
                from product_categories as product_category where product_category.categoryId = ${cat_id}                        
               )`)
           ]                   
       }
        const product = await Product?.findAll({
            where: {
                id : cat_id ? allProductId : 
               {[Op.not] : null},
               name : {
                      [Op.like] : [`%${word}%`]
              },
              status : 1
            },
          ...opt
        });
                // @get total blog, according to the blog query
                const total = await Product?.count({
                    where: {
                        id : cat_id ? allProductId : 
                       {[Op.not] : null},
                       name : {
                              [Op.like] : [`%${word}%`]
                      },
                      status : 1
                    }
                });

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


//should be done
//untuk tampilin show kategorinya
export const showCategory = async(req,res,next) =>{
    try{
        const cat= await Category?.findAll();
        res.status(200).json({category : cat})
    }
    catch(error){
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

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




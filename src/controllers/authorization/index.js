import { request } from "express"
import { ValidationError } from "yup"
import * as config from "../../config/index.js"
import handlebars from "handlebars"
import transporter from "../../helpers/transporter.js"
import {User} from "../../models/relation.js"
import { Sequelize, Op } from "sequelize"
import db from "../../models/index.js"
import { hashPassword, comparePassword } from "../../helpers/encryption.js"
import { createToken, verifyToken } from "../../helpers/token.js"
import { USER_ALREADY_EXISTS, USER_DOES_NOT_EXISTS, INVALID_CREDENTIALS } from "../../middlewares/error.handler.js"
import { LoginValidationSchema, RegisterValidationSchema, IsEmail, PasswordValidationSchema, ForgotPassValidationSchema, CashierValidationSchema } from "./validation.js"
import fs from "fs"
import path from "path"

const cache = new Map();

export const showAllCashiers= async(req,res,next) =>{
    try{
        const users= await User?.findAll({where : {role : 2, status : 1}});
        res.status(200).json({users})
    }
    catch(error){
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

// @register process
export const registerCashier = async (req, res, next) => {
    try {
        // @create transaction
        const transaction = await db.sequelize.transaction(async()=>{      

        // @validation
        const { username, password, email} = req.body;
        await RegisterValidationSchema.validate(req.body);

        // @check if user already exists
        const userExists = await User?.findOne({ where: { [Op.or]: [{username},{email}] } });
        if (userExists) throw ({ status : 400, message : USER_ALREADY_EXISTS });

        // @create user -> encypt password
        const hashedPassword = hashPassword(password);
        const user = await User?.create({
            username,
            password : hashedPassword,
            email,
        });

        // @delete password from response
        delete user?.dataValues?.password;

        // @generate access token
        const accessToken = createToken({ id: user?.dataValues?.id, role : user?.dataValues?.role });

        // @return response
        res
            .header("Authorization", `Bearer ${accessToken}`)
            .status(200)
            .json({
            message: "Cashier created successfully.",
            user
        });
        
        });  


    } catch (error) {

        // @check if error from validation
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

// @login process
export const login = async (req, res, next) => {
    try {
        // @validation, we assume that username will hold either username or email
        const { username, password } = req.body;
        await LoginValidationSchema.validate(req.body);

        // @check if username is email
        const isAnEmail = await IsEmail({email : username});
        console.log(isAnEmail)
        const query = isAnEmail ? { email : username } : {username };

        // @check if user exists
        const userExists = await User?.findOne({ where: query });
        if (!userExists) throw ({ status : 400, message : USER_DOES_NOT_EXISTS })
        
        // @check if password is correct
        if(userExists?.dataValues?.role == 2){
            const isPasswordCorrect = comparePassword(password, userExists?.dataValues?.password);
            if (!isPasswordCorrect) throw ({ status : 400, message : INVALID_CREDENTIALS });
        }
        
        // @delete password from response
        delete userExists?.dataValues?.password;
        
        // @check token in chache
       const cachedToken = cache.get(userExists?.dataValues?.id)
       const isValid = cachedToken && verifyToken(cachedToken)
       let accessToken = null
       //@check if token exist and valid
       if (cachedToken && isValid) {
           accessToken = cachedToken
       } else {
           // @generate access token
           accessToken = createToken({ id: userExists?.dataValues?.id, role : userExists?.dataValues?.role });
           cache.set(userExists?.dataValues?.id, accessToken)
        }        
          
            // @return response
        res.header("Authorization", `Bearer ${accessToken}`)
            .status(200)
            .json({ user : userExists })
    } catch (error) {
        // @check if error from validation
        if (error instanceof ValidationError) {
            return next({ status : 400, message : error?.errors?.[0] })
        }
        next(error)
    }
}

//keeplogin
export const keepLogin = async (req,res,next) => {
    try{

        //@find the user's data
        const userResult = await User?.findOne( { where : { id : req?.user?.id } });

        //send data via response
        res.status(200).json({userResult})


    } catch (error) {
        next(error)
    }

}

//forgotpassword (get email, send verif to reset password)
export const forgotPass = async ( req,res,next) => {
    try{
        const transaction = await db.sequelize.transaction(async()=>{     
        // @ email validation
        const  {email}  = req.body;

        //@input validation
        await ForgotPassValidationSchema.validate(email); 

        //@ get id from email
        // @first, find the user's data
        const userResult = await User?.findOne( { where : {email: email } });

         // @generate access token
         const accessToken = createToken({ id: userResult?.id, role : userResult?.role }); 

         
         let receiver = userResult?.dataValues?.username
        //@send verification email
        const template = fs.readFileSync(path.join(process.cwd(), "templates", "forgotPass.html"), "utf8");
        const html = handlebars.compile(template)({ name: (receiver.charAt(0).toUpperCase() + receiver.slice(1)), link :(config.REDIRECT_URL + `/reset-password/${accessToken}`) })
        
        const mailOptions = {
            from: `Cashier App Team Support <${config.GMAIL}>`,
            to: email,
            subject: "Forgot Password",
            html: html}
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) throw error;
                console.log("Email sent: " + info.response);
            })
            // @return response
           res
               .status(200)
               .json({
               message: "We have sent verification email for reset password",
           });
        });

    } catch (error){
        next(error)
    }
}

//reset password
export const reset = async(req,res,next) =>{
    try{
        //@grab password from res; validate and encrypt it into hashedpassword
        const {password} = req.body;

        //@password template validation
        await PasswordValidationSchema.validate(password);
        const hashedPassword = hashPassword(password);

        //@update user data
        await User?.update({ password: hashedPassword}, {
            where: {
                id : req?.user?.id
            }
          });
        
        // @ send rexponse message only, cause they need to relogin
        res
        .status(200)
        .json({
        message: "Success! Your new password is ready to use. Go back to login page",
    });
    } catch(error){
        next(error)
    }
}


//change username/email/password cashier
export const changeCashier = async(req,res,next) =>{
    try{
        
        const data = req.body;
        //validation
        await CashierValidationSchema.validate(req.body);
        //update product data on sql server
        await User?.update({
            name: req?.body?.name,
            email : req?.body?.email,
            password : req?.body?.password,
        },{
            where: {
              id: req?.body?.id
            }
          });
        // @ send rexponse message only, based on postman api
        res
        .status(200)
        .json({
        message: `Success! Cashier #${req?.body?.id} data has been changed!`
    });
    } catch(error){
        next(error)
    }
}


export const deactivateCashier = async ( req,res,next) => {
    try{
        // @create transaction
        const transaction = await db.sequelize.transaction(async()=>{          
            const { id } = req.params;
        //update product data on sql server
        await User?.update({ status : 0},{
            where: {
              id: id
            }
          });
        res.status(200).json({message : "Delete product succeed"})
        });

    } catch (error){

    }
}

export const uploadImage = async (req, res, next) => {
    try {
        const transaction = await db.sequelize.transaction(async()=>{      
        // @check if image is uploaded
        if (!req.file) {
            throw new ({ status: 400, message: "Please upload an image." })
        }

        // @update the user profile
        await User?.update({ profileURL: req?.file?.path}, { where : { id : req?.user?.id } })

        // @send response
        res.status(200).json({ message : "Image uploaded successfully.", id : req?.user?.id, profileURL : req.file?.path })
    });
    } catch (error) {
        next(error)
    }
}
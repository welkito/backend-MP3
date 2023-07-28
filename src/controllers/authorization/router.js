import { Router } from "express"
import { verifyUser ,verifyAdmin,verifyCashier} from "../../middlewares/token.verify.js"

//@for image handlers
import { createCloudinaryStorage,createUploader } from "../../helpers/uploader.js"
const storage = createCloudinaryStorage("Public/CashierProfiles")
const uploader = createUploader(storage)

// @import the controller
import * as AuthControllers from "./index.js"

// @define routes
const router = Router()

//routes for authentication
router.get("/users",AuthControllers.showAllCashiers)//
router.post("/login", AuthControllers.login)//
router.put("/forgotPass",AuthControllers.forgotPass)////
router.patch("/resetPass", verifyUser, AuthControllers.reset)///
router.get("/",verifyUser, AuthControllers.keepLogin)//

router.patch("/profile",verifyCashier, uploader.single("file"), AuthControllers.uploadImage)//buat cashier

router.post("/register",verifyAdmin, AuthControllers.registerCashier)//admin need//
router.patch("/change", verifyAdmin,  AuthControllers.changeCashier)//need admin onlye
router.delete("/delete/:id",verifyAdmin, AuthControllers.deactivateCashier) //only admin

export default router

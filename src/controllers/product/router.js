import { Router } from "express"
import { verifyAdmin } from "../../middlewares/token.verify.js"
// @import the controller
import * as ProductControllers from "./index.js"
import { createCloudinaryStorage,createUploader } from "../../helpers/uploader.js"

const storage = createCloudinaryStorage("Public/Products")
const uploader = createUploader(storage)
// @define routes
const router = Router()
//routes for authentication
router.post("/category", ProductControllers.addCategory)//need
router.post("/",uploader.single("file"), ProductControllers.addProduct)//need
router.get("/category", ProductControllers.showCategory)
router.get("/", ProductControllers.showProduct)
router.patch("/category", ProductControllers.updateCategory)//need
router.patch("/",uploader.single("file"), ProductControllers.updateProduct)//need
router.delete("/category/:id",  ProductControllers.deleteCategory)//need
router.delete("/:id",  ProductControllers.deleteProduct)//need
// router.post("/admin",  ProductControllers.loginAdmin)

export default router

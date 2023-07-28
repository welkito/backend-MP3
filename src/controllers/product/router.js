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
router.post("/category",verifyAdmin, ProductControllers.addCategory)//need
router.post("/", verifyAdmin, uploader.single("file"), ProductControllers.addProduct)//need
router.get("/category", ProductControllers.showCategory)
router.get("/", ProductControllers.showProduct)
router.patch("/category", verifyAdmin, ProductControllers.updateCategory)//need
router.patch("/", verifyAdmin, uploader.single("file"), ProductControllers.updateProduct)//need
router.delete("/category/:id",verifyAdmin, ProductControllers.deleteCategory)//need
router.delete("/:id",verifyAdmin, ProductControllers.deleteProduct)//need

export default router

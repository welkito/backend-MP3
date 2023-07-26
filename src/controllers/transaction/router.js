import { Router } from "express"
import { verifyUser } from "../../middlewares/token.verify.js"
// @import the controller
import * as TransactionControllers from "./index.js"

// @define routes
const router = Router()
//routes for authentication
router.post("/", verifyUser, TransactionControllers.createTransaction)//need user auth
router.get("/:id", verifyUser, TransactionControllers.showTransaction) //need user auth


export default router

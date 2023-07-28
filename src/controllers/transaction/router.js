import { Router } from "express"
import { verifyCashier} from "../../middlewares/token.verify.js"
// @import the controller
import * as TransactionControllers from "./index.js"

// @define routes
const router = Router()
//routes for authentication
router.post("/", verifyCashier, TransactionControllers.createTransaction)//need user auth
router.get("/:id", TransactionControllers.showTransaction) //need user auth


export default router

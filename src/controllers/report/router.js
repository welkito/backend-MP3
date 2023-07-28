import { Router } from "express"
import { verifyAdmin } from "../../middlewares/token.verify.js"
// @import the controller
import * as ReportController from "./index.js"

// @define routes
const router = Router()
//routes for authentication
router.post("/",verifyAdmin, ReportController.createReport)//need admin auth


export default router

import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import * as middleware from "./src/middlewares/index.js";
// import errorHandler from "./src/middlewares/index.js";
import path from "path";
// import requestLogger from "./src/middlewares/logger.js";

// @config dotenv
dotenv.config();

// @create express app
const app = express();

// @use body-parser
app.use(bodyParser.json())
app.use(cors({ exposedHeaders : "Authorization" }))
app.use(middleware.requestLogger)

// @root route
app.get("/", (req, res) => {
    res.status(200).send("Welcome to Mini-Project API! ;)")
})

// @use router
import ProductRouters from "./src/controllers/product/router.js"

app.use("/api/product",ProductRouters)


// @global error handler
app.use(middleware.errorHandler)

// @listen to port
const PORT = process.env.PORT;
console.log(process.env.PORT)
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
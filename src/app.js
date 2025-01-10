import express, { Router } from "express"
import cookieParser from "cookie-parser";
import cors from "cors"; //it is a middleware
// import router from "./routes/healthCheck.routes";

const app = express();

app.use(
    cors({
        origin : process.env.CORS_ORIGIN,
        credentials : true
    })
)

//common middleware
app.use(express.json({limit:"16kb"})) 
app.use(express.urlencoded({ extended : true , limit : "16kb" }))
app.use(express.static("public")) // to serve acceset like images and video.
app.use(cookieParser())

//import Routes
import healthCheckRouter from "./routes/healthCheck.routes.js"
import userRouter from "./routes/user.routes.js";
import {errorHandler} from "./middlewares/error.middleware.js"

//routes
app.use("/api/v1/healthcheck" , healthCheckRouter)
app.use("/api/v1/users" , userRouter)

app.use(errorHandler)
export { app } 
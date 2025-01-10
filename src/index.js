import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./.env"
})

const PORT = process.env.PORT || 8001;

connectDB()
.then(() => {
    app.listen(PORT,() => {
        console.log(`Listing to port ${PORT}`);
    })
})
.catch((err) => {
    console.log("MondoDB connection error", err);
    
})

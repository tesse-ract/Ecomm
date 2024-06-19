import express from "express"
import product from "./routes/productRoute.js";
import user from "./routes/userRoute.js"
import order from "./routes/orderRoute.js"
import payment from "./routes/paymentRoute.js"
import {error} from "./middlewares/error.js"
import fileUpload from "express-fileupload";
// import asyncErrorHandler from "./middlewares/asyncErrorHandler.js";
import cookieParser from "cookie-parser";

process.on("uncaughtException",(err)=>{
    console.log(`Error is ${err}`);
    console.log("Closing server due to uncaught exception");
    process.exit(1);
})

const app=express();

app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({useTempFiles:true})); // useTempFiles true is very important or else no tempFilePath in uploaded images in postman, and won't be uploaded to cloudinary


app.use("/api/v1",product);
app.use("/api/v1",user);
app.use("/api/v1",order);
app.use("/api/v1",payment)

app.get('/',(req,res)=>{
    res.send("Hello world");
})

app.use(error);


export default app;
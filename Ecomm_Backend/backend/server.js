import app from "./app.js"
import dotenv from "dotenv"
import {connectDB} from "./config/database.js"
import {v2 as cloudinary} from 'cloudinary';

process.on("uncaughtException",(err)=>{
    console.log(`Error is ${err}`);
    console.log("Closing server due to uncaught exception");
    process.exit(1);
})


dotenv.config({
    path:"./config/config.env"
});

connectDB();

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

console.log(process.env.PORT);

const server=app.listen(process.env.PORT,()=>{ // In JavaScript, especially in Node.js applications, the order of execution matters. When you create an Express app instance (app) and immediately call app.listen() to start the server, you are trying to start the server before all the necessary configurations and middleware might have been set up. This can lead to errors, as you observed.
    console.log("Server is working"); 
})

// unhandled promise rejection , eg- connection string galat dedi config.env mein

process.on("unhandledRejection",(err)=>{
    console.log(`Error is ${err}`);
    console.log("Closing server due to unexpected error");
    server.close(()=>{
        process.exit(1);
    })
})
import mongoose from "mongoose"

export const connectDB=()=>{
    mongoose.connect(process.env.DB_URI);
    console.log("DB Connected");
}

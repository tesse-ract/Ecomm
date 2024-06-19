import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs"

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name is required"],
        maxLength:[30,"Name can't be greater than 30 characters"],
        minLength:[4,"Name can't be less than 4 characters"]
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        validate:[validator.isEmail,"Enter a valid email"],
        unique:true,
    },
    password:{ 
        type:String,
        required:[true,"A valid password is needed"],
    },
    avatar:{
        public_id:{
            type:String,
            // required:true
        },
        url:{
            type:String,
            // required:true
        }
    },
    role:{
        type:String,
        default:"user"
    },
    createdAt:{
        type:Date,
        default:Date.now(),
    },
    confirmed:{
        type:Boolean,
        default:false
    },
    expireAt:{ // basically delete this document after 5 minutes of creation if the user hasn't verfied account creation through verification link

    // though I have specified 10 seconds as expire time but the issue over here is that in mongo db it will not immediately get deleted exactly after 10 seconds, there might be a lag so keep that in mind
        type:Date,
        index:{
            expireAfterSeconds:10,
            partialFilterExpression:{confirmed:false}
        }
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
})

userSchema.pre('save',async function(next){

    if(!this.isModified("password"))
    {
        console.log("Haanji");
        next();
        return ; // yahan pe return nahi kiya tha jiski wajah se password was getting changed again and again even if I had not modified it, 
    }
    console.log("yes");
    const hashPass=await bcrypt.hashSync(this.password,10);

    this.password=hashPass;
})


export default mongoose.model("User",userSchema);
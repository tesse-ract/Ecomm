import mongoose from "mongoose"

const productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name is required"],
        trim:true //trims the whitespace from both sides of string
    },
    description:{
        type:String,
        required:[true,"Description is required"]
    },
    price:{
        type:Number,
        required:[true,"Price is required"],
        min:[100,"Price can't be less than Rs 100"],
        max:[100000,"Price can't be more than Rs 100000"]
    },
    ratings:{
        type:Number,
        default:0
    },
    images:[{
        public_id: {
            type:String,
             required:[true,"Valid id needed"]
        },
        url: {
            type:String,
             required:[true,"Valid url need"]
        }
    }],
    category:{
        type:String,
        required:[true,"Product Category is required"]
    },
    stock:{
        type:Number,
        required:[true,"Stock is required"],
        min:[4,"Stock can't be less than 4"],
        max:[100,"Stock can't be more than 100"]
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:{
        type:Map,
        of:{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User", // to refer to the documents in user collection, to fill some field in this document, basically we want the id of user who created this review
            required: true,
          },
          name: {
            type: String,
            required: true,
          },
          rating: {
            type: Number,
            required: true,
          },
          comment: {
            type: String,
            required: true,
          },
          createdAt:{
            type:String,
            default:Date.now()
          }
    },
    default:{}
    },
    createdAt:{
        type:String,
        default: Date.now()
    }
})

export default mongoose.model("Product",productSchema);
import Product from "../models/productModel.js"
import ErrorHandler from "../utils/errorHandler.js";
import AdvancedSearch from "../utils/advancedSearch.js";
import cloudinary from "cloudinary"

const getAllProducts=async(req,res)=>{
    // for dealing with search bar and filters
     const search=new AdvancedSearch(req.query);
     console.log("hello");
     search.modifyQuery();
     console.log(search.query);
    await search.searchResults();
     const products=[...search.results];
    res.status(200).json({
        success:true,
        products:products
    })
}

const createProduct=async(req,res)=>{

    console.log(req.body);
    console.log("haan");
    console.log(req.files.images);

    //console.log(req.body.images);

     let images=[];

    // if(typeof req.body.images==="string")
    // {
    //     images.push(req.body.images);
    // }
    // else
    // {
    //     images=req.body.images;
    // }

    if(typeof req.files.images==="string")
    {
        images.push(req.files.images);
    }
    else
    {
        images=req.files.images;
    }

    console.log("hola");

     console.log(images.length);

    let imageLinks=[]


    for(let i=0;i<images.length;i++)
    {
        let image=images[i];
        console.log(image);

        console.log("hanji");
        const uploaded=await cloudinary.uploader.upload(image.tempFilePath,{
            folder:"products"
        });

        console.log("hello ");
        console.log(uploaded);

        imageLinks.push({
            public_id:uploaded.public_id,
            url:uploaded.secure_url
        })
    }

     console.log(imageLinks);

    // console.log("hess");

    req.body.user=req.user.id;
    // req.body.images=imageLinks

    req.body.images=imageLinks

    console.log("hoji");
    console.log(req.body);
    const product=await Product.create(req.body);
    res.status(200).json({
        success:true,
        message:"product created successfully",
        product:product
    })
}

// Update Product - Admin 
const updateProduct=async(req,res,next)=>{
    const product=await Product.findById(req.params.id);
    if(!product) 
    {
        return next(new ErrorHandler(500,"Product not found"));
    }

    let images=[];

    if(typeof req.body.images==="string")
    {
        images.push(req.body.images);
    }
    else
    {
        images=req.body.images;
    }

    if(images!=undefined)
    {
        for(let i=0;i<product.images.length;i++)
        {
            await cloudinary.uploader.destroy(product.images[i].public_id)
        }
    
        let imageLinks=[];
    
        for(let i=0;i<images.length;i++)
        {
            const img=await cloudinary.uplaoder.upload(images[i],{
                folder:"products",
            });

            imageLinks.push({
                public_id:img.public_id,
                url:img.secure_url
            });
        }
        req.body.images=imageLinks;
    }
    const tempProduct=await Product.findOneAndUpdate({_id:req.params.id},req.body,{new:true,runValidators:true}); // new:true basically returns the updated product, runValidators:true because by default validations are off
    res.status(200).json({
        success:true,
        message:"product updated successfully",
        tempProduct:tempProduct
    });
}

const deleteProduct=async(req,res)=>{ 
    const product=await Product.findById(req.params.id);
    if(!product)
    {
        return next(new ErrorHandler(500,"Product not found"));
    }

    for(let i=0;i<product.images.length;i++)
    {
        await cloudinary.uploader.destroy(product.images[i].public_id)
    }

    const deleted=await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success:true,
        message:"Product deleted successfully",
        deleted:deleted
    });
}

const getProductDetails=async(req,res)=>{
    const product=await Product.findById(req.params.id);
    if(!product)
    {
        return next(new ErrorHandler(500,"Product not found"));
    }
    res.status(200).json({
        success:true,
        message : "Product Retrieved successfully",
        product
    })
}

// Get Admin Products - Admin

const getAdminProducts=async(req,res,next)=>{
    const products=await Product.find();

    res.status(200).json({
        success:true,
        products
    })
}

// Create Product Review - User

const createProductReview=async(req,res,next)=>{
    const {rating,comment,productId} = req.body;


    // check if the productId is invalid
    const product=await Product.findById(productId);

    if(!product)
    {
        return next(new ErrorHandler("No such product exists"));
    }

    // dd/mm//yyyy format date

    let today = new Date();
    
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    
    let yyyy = today.getFullYear();
    
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    today = dd + '/' + mm + '/' + yyyy;

    // the actual review object
    const review={
        user:req.user._id,
        name:req.user.name,
        comment:comment,
        createdAt:today,
        rating  
    }

    // check if the user has already given a review and trying to update it by giving a new review, hashmap implementation

    let reviews=product.reviews;

    let sumOfReviewRatings=product.numOfReviews*product.ratings;

    const mapKey=req.user.email.replace(".",'-');

    if(reviews.has(mapKey))
    {
        sumOfReviewRatings-=reviews.get(mapKey).rating;
    }

    reviews.set(mapKey,review);

    sumOfReviewRatings+=rating;

    const newRating=sumOfReviewRatings/reviews.size;

    product.ratings=newRating;
    product.reviews=reviews;
    product.numOfReviews=reviews.size;

    await product.save();

    return res.status(200).json({
        success:"true",
        message:"review created successfully",
        review
    })
}

const getProductReviews= async(req,res,next)=>{
    const product=await Product.findById(req.query.id);

    if(!product)
    {
        return next(new ErrorHandler(400,"No such product exists with this id"));
    }

    const reviews=product.reviews;
    return res.status(200).json({
        success:"true",
        reviews
    })
}

const deleteReview= async(req,res,next)=>{
    const product=await Product.findById(req.query.productId);

    if(!product)
    {
        return next(new ErrorHandler(400,"No such product exists"));
    }

    let reviews=product.reviews;
    console.log(reviews);
    let sumOfReviewRatings=0;
   for(let [key,value] of reviews){
    if(reviews.get(key)._id.toString()===req.query.id)
    {
        reviews.delete(key);
    }
    else
    sumOfReviewRatings+=reviews.get(key).rating;
   }

   const numOfReviews=reviews.size;
   let ratings=0;
   if(numOfReviews!=0)
   {
    ratings=sumOfReviewRatings/numOfReviews;
   }

   await Product.findByIdAndUpdate(req.query.productId,{
    reviews,ratings,numOfReviews
   },{
    new:true,
    runValidators:true
   })

   return res.status(200).json({
    success:true,
    message:"Review Deleted successfully"
   })
}

 export {getAllProducts,createProduct,updateProduct,deleteProduct,getProductDetails,createProductReview,getAdminProducts,getProductReviews,deleteReview};
import User from "../models/userModel.js";
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import ErrorHandler from "../utils/errorHandler.js";
import bcrypt from "bcryptjs"
import cryptoRandomString from "crypto-random-string"
import {sha256} from "crypto-hash"
import asyncHandler from "express-async-errors"


const createUser=async(req,res,next)=>{

    let password=req.body.password;

    const isWhiteSpace=/(?=.*\s)/
        if(isWhiteSpace.test(password))
        {
            return next(new ErrorHandler(400,"Password can't have white space"))
        }
        const isUpperCaseCharacter=/(?=.*[A-Z])/
        if(!isUpperCaseCharacter.test(password))
        {
            return next(new ErrorHandler(400,"Password should have atleast 1 uppercase character"))
        }
        const isLowerCaseCharacter=/(?=.*[a-z])/
        if(!isLowerCaseCharacter.test(password))
        {
            return next(new ErrorHandler(400,"Password should have atleast 1 lowercase character"))
        }
        const isDigit=/(?=.*[0-9])/
        if(!isDigit.test(password))
        {
            return next(new ErrorHandler(400,"Password should have atleast 1 digit"))
        }
        const isContainsSymbol =
        /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹])/;
        if(!isContainsSymbol.test(password))
        {
            return next(new ErrorHandler(400,"Password should have atleast 1 special symbol"))
        }
        if(password.length<8||password.length>16)
        {
            return next(new ErrorHandler(400,"Password can't be less than 8 characters and greater than 16 characters"))
        }


    let user=await User.findOne({email:req.body.email});
    if(user)
    {
        if(user.confirmed==false)
        {
            return next(new ErrorHandler(400,"Account created but not verified yet, please verify through verification link sent on your email"))
        }
        return next(new ErrorHandler(400,"Account already exists with this email, please log in"))
    }

    user=await User.create(req.body);

    const verificationToken=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:24*60*60*1000});

    console.log(verificationToken);

    const transporter=nodemailer.createTransport({
        host:"smtp.gmail.com",
        port:465,
        secure:true,
        auth:{
            user:"codewithujval@gmail.com",
            pass:"zvlq ftqb gyie gvzd"
        },
    });

    // const verificationLink=`${req.protocol}://${req.get("host")}/api/v1/register/verification/${verificationToken}`

    const redirectURL=`${req.protocol}://${req.get("host")}/verification`

    // console.log(verificationLink);

    const info=await transporter.sendMail({
        from:"codewithujval@gmail.com",
        to:`${user.email}`,
        subject:"Ecommerce: Account Confirmation",
        text:`We received your request to create an account through this id. 
        
         If this was you, confirm account creation by copying this verification token and pasting it on respective url
         Token - ${verificationToken}
         URL - ${redirectURL}
        
        If this wasn't you, don't click on the link and ignore this mail`
    })

        console.log("Account confirmation mail sent successfully")

    return res.status(201).json({
        success:true,
        message:"User created, but not confirmed yet An account confirmation mail has been sent to your email. Kindly click on it within 5 minutes to verify account creation", 
        user:user
    })
}

const verifyAccountCreation=async(req,res,next)=>{
    const {token}=req.params;
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        console.log(decoded);
    const user=await User.findOne({_id:decoded.id})
    if(!user)
    {
        return next(new ErrorHandler(400,"Account verification failed. No such user tried to create an account"));
    }
    if(user.confirmed==true)
    {
        return next(new ErrorHandler(400,"Account already confirmed"));
    }
    user.confirmed=true;
    user.save();

    res.cookie("token",token);

    return res.status(200).json({
        success:true,
        message:"Account Created successfully" 
    })
    }
    catch(err){
        console.log(err);
        return;
    }
}

const userLogin=async(req,res,next)=>{
    const{email,password}=req.body;


    const isWhiteSpace=/(?=.*\s)/
        if(isWhiteSpace.test(password))
        {
            return next(new ErrorHandler(400,"Password can't have white space"))
        }
        const isUpperCaseCharacter=/(?=.*[A-Z])/
        if(!isUpperCaseCharacter.test(password))
        {
            return next(new ErrorHandler(400,"Password should have atleast 1 uppercase character"))
        }
        const isLowerCaseCharacter=/(?=.*[a-z])/
        if(!isLowerCaseCharacter.test(password))
        {
            return next(new ErrorHandler(400,"Password should have atleast 1 lowercase character"))
        }
        const isDigit=/(?=.*[0-9])/
        if(!isDigit.test(password))
        {
            return next(new ErrorHandler(400,"Password should have atleast 1 digit"))
        }
        const isContainsSymbol =
        /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹])/;
        if(!isContainsSymbol.test(password))
        {
            return next(new ErrorHandler(400,"Password should have atleast 1 special symbol"))
        }
        if(password.length<8||password.length>16)
        {
            return next(new ErrorHandler(400,"Password can't be less than 8 characters and greater than 16 characters"))
        }

    const user=await User.findOne({email:email});

    if(!user||user.confirmed==false)
    {
        return next(new ErrorHandler(400,"Invalid name or password"));
    }

    const isCorrectPassword=await bcrypt.compare(password,user.password);

    if(!isCorrectPassword)
    {
        return next(new ErrorHandler(400,"Invalid Name or password"));
    }

    const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:24*60*60});

    const options={
        expiresIn:Date.now()*24*60*60*1000
    }


    console.log(`Token is ${token}`);

    res.cookie('token',token,options);

    return res.status(200).json({
        success:true,
        message:"User logged in successfully"
    })
    
}

//userLogout


const userLogout=async(req,res,next)=>{
    res.cookie("token",null,{
        expiresIn: Date.now()
    })

    res.status(200).json({
        success:true,
        message:"Logged out"
    })
}

// forgot password

const forgotPassword=async(req,res,next)=>{
    const user=await User.findOne({email:req.body.email});
    if(!user||user.confirmed==false)
    {
        return next(new ErrorHandler(404,"User not found"))
    }
     const resetToken=cryptoRandomString({length:10});

    const hashToken=await sha256(resetToken);

    user.resetPasswordToken=hashToken;
    user.resetPasswordExpire=Date.now() + 15*60*1000;

    await user.save();

    const resetPasswordUrl=`${req.protocol}://${req.get("host")}/api/v1/password/reset/${hashToken}`;

    const transporter=nodemailer.createTransport({
        host:"smtp.gmail.com",
        port:465,
        secure:true,
        auth:{
            user:"codewithujval@gmail.com",
            pass:"zvlq ftqb gyie gvzd"
        },
    });

    try{
        const info=await transporter.sendMail({
            from:"codewithujval@gmail.com",
            to:`${user.email}`,
            subject:"Ecommerce: Password Recovery",
            text:`We received your request to reset password
            
            If this was you,click on this link ${resetPasswordUrl}
            
            If this wasn't you, don't click on the link and ignore this mail`
        })
    }
    catch(err){
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;

        await user.save();

        return next(new ErrorHandler(500,err));
    }

    return res.status(200).json({
        success:true,
        message:"Password Recovery mail sent successfully"
    })
}


// reset password

const resetPassword=async (req,res,next)=>{
    const {resetPassToken}=req.params;

     console.log(resetPassToken);
    
    let user=await User.findOne({resetPasswordToken:resetPassToken,resetPasswordExpire:{$gt:Date.now()}});

    if(!user)
    {

        user=await User.findOne({resetPasswordToken:resetPassToken});

        if(!user)
        {
            return next(new ErrorHandler(400,"No such reset password request was raised"))
        }

        user.resetPasswordExpire=undefined;
        user.resetPasswordToken=undefined;

        return next(new ErrorHandler(400,"Password reset request was raised but it has expired"))
    }


    if(req.body.password!=req.body.confirmPassword)
    {
        return next(new ErrorHandler(400,"Password and confirm password doesn't match"));
    }

    let password=req.body.password;

    const isWhiteSpace=/(?=.*\s)/
        if(isWhiteSpace.test(password))
        {
            return next(new ErrorHandler(400,"Password can't have white space"))
        }
        const isUpperCaseCharacter=/(?=.*[A-Z])/
        if(!isUpperCaseCharacter.test(password))
        {
            return next(new ErrorHandler(400,"Password should have atleast 1 uppercase character"))
        }
        const isLowerCaseCharacter=/(?=.*[a-z])/
        if(!isLowerCaseCharacter.test(password))
        {
            return next(new ErrorHandler(400,"Password should have atleast 1 lowercase character"))
        }
        const isDigit=/(?=.*[0-9])/
        if(!isDigit.test(password))
        {
            return next(new ErrorHandler(400,"Password should have atleast 1 digit"))
        }
        const isContainsSymbol =
        /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹])/;
        if(!isContainsSymbol.test(password))
        {
            return next(new ErrorHandler(400,"Password should have atleast 1 special symbol"))
        }
        if(password.length<8||password.length>16)
        {
            return next(new ErrorHandler(400,"Password can't be less than 8 characters and greater than 16 characters"))
        }

    user.password=req.body.password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;

    await user.save();

    const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:24*60*60});

     console.log(`Token is ${token}`);

    const options={
        expiresIn:Date.now()*24*60*60*1000
    }


    res.cookie('token',token,options);

    return res.status(200).json({
        success:true,
        message:"Password reset successfully"
    })

}

// get user detail

const userDetail=async(req,res,next)=>{
    return res.status(200).json({
        success:"true",
        message:"user details retrieved successfully",
        user:req.user
    })
}

// update password

const updatePassword=async(req,res,next)=>{

    let password=req.body.password,newPassword=req.body.newPassword,confirmPassword=req.body.confirmPassword;

    const isWhiteSpace=/(?=.*\s)/
        if(isWhiteSpace.test(password)||isWhiteSpace.test(newPassword)||isWhiteSpace.test(confirmPassword))
        {
            return next(new ErrorHandler(400,"Password can't have white space"))
        }
        let isUpperCaseCharacter=/(?=.*[A-Z])/
        if(!isUpperCaseCharacter.test(password)||!isUpperCaseCharacter.test(newPassword)||!isUpperCaseCharacter.test(confirmPassword))
        {
            return next(new ErrorHandler(400,"Password should have atleast 1 uppercase character"))
        }
        let isLowerCaseCharacter=/(?=.*[a-z])/
        if(!isLowerCaseCharacter.test(password)||!isLowerCaseCharacter.test(newPassword)||!isLowerCaseCharacter.test(confirmPassword))
        {
            return next(new ErrorHandler(400,"Password should have atleast 1 lowercase character"))
        }
        let isDigit=/(?=.*[0-9])/
        if(!isDigit.test(password)||!isDigit.test(newPassword)||!isDigit.test(confirmPassword))
        {
            return next(new ErrorHandler(400,"Password should have atleast 1 digit"))
        }
        let isContainsSymbol =
        /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹])/;
        if(!isContainsSymbol.test(password)||!isContainsSymbol.test(newPassword)||!isContainsSymbol.test(confirmPassword))
        {
            return next(new ErrorHandler(400,"Password should have atleast 1 special symbol"))
        }
        if(password.length<8||password.length>16||newPassword.length<8||newPassword.length>16||confirmPassword.length<8||confirmPassword.length>16)
        {
            return next(new ErrorHandler(400,"Password can't be less than 8 characters and greater than 16 characters"))
        }

    if(!bcrypt.compareSync(req.body.password,req.user.password))
    {
        return next(new ErrorHandler(400,"Wrong Password"));
    }
    
    if(req.body.newPassword!=req.body.confirmPassword)
    {
        return next(new ErrorHandler(400,"New Password and confirm Password fields don't match"));
    }
    const user=await User.findById(req.user.id);
    user.password=req.body.newPassword; 
    await user.save();

    const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{
        expiresIn: '1d'
    }); 

    const options={
        expiresIn:Date.now()*24*60*60*1000
    }

    res.cookie("token",token,options);

    return res.status(201).json({
        success:true,
        message:"Password updated successfully"
    })
}

// update user profile

const updateUserProfile=async(req,res,next)=>{

    const user=await User.findById(req.user.id);

    const checkUser=await User.findOne({email:req.body.email});

    if(checkUser&&checkUser.email!=user.email)
    {
        return next(new ErrorHandler(400,"Can't update profile, new email already registered"));
    }

    user.name=req.body.name;
    user.email=req.body.email;

    await user.save();

    res.status(200).json({
        success:"true",
        message:" User Details updated successfully"
    })
}

// get all users - admin

const getAllusers= async(req,res,next)=>{
    const users=await User.find();

    return res.status(200).json({
        success:true,
        message:"All users fetched successfully",
        users
    })
}

// Get single user - admin

const getSingleUser=async(req,res,next)=>{

    const {id}=req.params;
    const user=await User.findOne({_id:id});

    if(!user)
    {
        return next(new ErrorHandler(400,`No such user exists with id`));
    }

    return res.status(200).json({
        success:true,
        message:"User details fetched successfully",
        user
    })
}

// update user roles - admin

const updateUserRole=async(req,res,next)=>{
    const user=await User.findOne({_id:req.params.id});

    if(!user)
    {
        return next(new ErrorHandler(400,"No such user exists in DB"));
    }

    const newUser={
        name: req.body.name,
        email : req.body.email,
        role : req.body.role
    }

    await User.findByIdAndUpdate(req.params.id,newUser,{
        new:true,
        runValidators:true
    });

    return res.status(200).json({
        success:true,
        message:"User Role updated successfully",
    })
}


// Delete user - admin

const deleteUser= async(req,res,next)=>{
    const user=await User.findById(req.params.id);

    if(!user)
    {
        return next(new ErrorHandler(400,"No such user exists with this id"));
    }

    await User.deleteOne({_id:req.params.id});

    return res.status(200).json({
        success:true,
        message:"User deleted successfully"
    })
}


export {createUser,verifyAccountCreation,userLogin,resetPassword,forgotPassword,userLogout,userDetail,updatePassword,deleteUser,updateUserProfile,updateUserRole,getSingleUser,getAllusers};
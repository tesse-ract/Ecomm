import jwt from "jsonwebtoken"
import ErrorHandler from "../utils/errorHandler.js";
import User from "../models/userModel.js"

export const isAuthenticatedUser=async (req,res,next)=>{
    const {token}=req.cookies;

    if(!token)
    {
        return next(new ErrorHandler(401,"You aren't authorized to access this resource, please log in"));
    }

    const decoded=jwt.verify(token,process.env.JWT_SECRET);

    const user=await User.findOne({_id:decoded.id});
    req.user=user;
    next();
}

export const authorizedRoles=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role))
        {
            return next(new ErrorHandler(403,"You are not authorized to access this resource"));
        }
        next();
    }
}
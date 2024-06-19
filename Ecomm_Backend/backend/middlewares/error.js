

export const error=(err,req,res,next)=>{
    err.statusCode=err.statusCode||500; 
    const message=err.message||"something went wrong";

    console.log(err);
    return res.status(err.statusCode).json({
        success:"false",
        message:message
    });
}
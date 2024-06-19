const asyncErrorHandler=(err,req,res,next)=>{
    const message=err.message||"Async error occured"
    err.statusCode=err.statusCode||500;
    return res.status(err.statusCode).json({
        success:false,
        message:message
    })
}

export default asyncErrorHandler;
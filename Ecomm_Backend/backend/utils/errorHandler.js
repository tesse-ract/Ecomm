import { Error } from "mongoose";

class ErrorHandler extends Error{
    constructor(statusCode,message){
        super(message);
        this.statusCode=statusCode;
    }
}

export default ErrorHandler;
import { User } from "../models/user.js";
import ErrorHandler from "../utils/util-class.js";
import { TryCatch } from "./errorMiddleware.js";


export const adminOnly=TryCatch(async(req,res,next)=>{
    const {id} = req.query;

    if(!id){
        return next(new ErrorHandler("Unauthorise access",401))
    }

    

    const user = await User.findById(id);
    if(!user){
        return next(new ErrorHandler("User not found",401));
    }

    if(user.role !== "admin"){
        return next(new ErrorHandler("User not found",401));
    }
    next();
})
import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import { NewUserRequestBody } from "../types/types.js";
import ErrorHandler from "../utils/util-class.js";
import { TryCatch } from "../middlewares/errorMiddleware.js";

export const newUser =TryCatch(async(req:Request<{},{},NewUserRequestBody>,
    res:Response,next:NextFunction)=>{
        console.log("gresrserhseh");
        const {name,email,photo,gender,_id,dob} = req.body;
        let user = await User.findById(_id);
        if(user){
            return res.status(200).json({
                success: true,
                message:`Welcome ${user.name}`,
                user,
            })
        }
        if(!_id || !name || !gender || !email || !dob || !photo){
            return next(new ErrorHandler("Please enter all fields",400))
        }

        user = await User.create({name,email,photo,gender,_id,dob:new Date(dob)});

        return res.status(200).json({
            success: true,
            message:`Welcome ${user.name}`,
            user,
        })
})

export const getAllUsers=TryCatch(async(req,res,next)=>{
    const users = await User.find({});

    return res.status(200).json({
        success:true,
        users,
    })
})


export const getAllUser=TryCatch(async(req,res,next)=>{
    const _id = req.params.id;
    const user = await User.findById(_id);

    if(!user){
        return next(new ErrorHandler("Invalid ID",400));
    }

    return res.status(200).json({
        success:true,
        user,
    })
})

export const deleteUser=TryCatch(async(req,res,next)=>{
    const _id = req.params.id;
    const user = await User.findById(_id);
    if(!user){
        return next(new ErrorHandler("Invalid ID",400));
    }

    await user.deleteOne();

    return res.status(200).json({
        success:true,
        message:"User Deleted Successfully",
    })
})
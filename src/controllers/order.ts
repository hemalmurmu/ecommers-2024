import { Request } from "express";
import { TryCatch } from "../middlewares/errorMiddleware";
import { NewOrderRequestBody } from "../types/types";
import { Order } from "../models/order";
import { invalidateCache, reduceStock } from "../utils/feaures";
import ErrorHandler from "../utils/util-class";
import { myChache } from "../app";



export const newOrder = TryCatch(
    async(req:Request<{},{},NewOrderRequestBody>,res,next)=>{
        
        
        const {shippingInfo,orderItems,user,subTotal,tax,shippingCharges,discount,total}=req.body;
        if(!shippingInfo || !orderItems || !user || !subTotal || !tax || !total){
            return next(new ErrorHandler("Please Enter All Fields",400))
        }
        const order=await Order.create({
            shippingInfo,orderItems,user,subTotal,tax,shippingCharges,discount,total
        });
        
        await reduceStock(orderItems);

        invalidateCache({product:true,order:true,admin:true,userId:user,productId: order.orderItems.map((i)=>String(i.productId)) });
        return res.status(201).json({
            success:true,
            message:"Order Places Successfully"
        })
    }
)


export const myOrders = TryCatch(
    async(req,res,next)=>{
        const { id:user} = req.query;
        let orders=[];
        const key = `my-orders-${user}`
        if( myChache.get(key)){
            orders = JSON.parse( myChache.get(key) as string);
        }else{
            const uid=String(user);
            orders = await Order.find({user:uid});
            myChache.set(key,JSON.stringify(orders))
        }

        return res.status(201).json({
            success:true,
            orders
        })
    }
)


export const allOrders = TryCatch(
    async(req,res,next)=>{
        const key = `all-orders`;

        let orders=[];
        if( myChache.get(key)){
            orders = JSON.parse( myChache.get(key) as string);
        }else{
            orders = await Order.find({}).populate("user","name");
            myChache.set(key,JSON.stringify(orders))
        }

        return res.status(201).json({
            success:true,
            orders
        })
    }
)


export const getSingleOrder=TryCatch(
    async(req,res,next)=>{
        
        const {id} =req.params;
        const key = `order-${id}`
        let order;

        if(myChache.has(key)){
            order=JSON.parse(myChache.get(key) as string);
        }else{
            order = await Order.findById(id).populate("user","name");
            if(!order){
                return next(new ErrorHandler("Order not found",404));
                }
            myChache.set(key,JSON.stringify(order))
        }
       
        return res.status(200).json({
            success:true,
            order,
        })
    }
)

export const processOrder=TryCatch(
    async(req,res,next)=>{
        
        const {id} =req.params;
        const order = await Order.findById(id);
        if(!order){
            return next(new ErrorHandler("Order not found",404));
            }
        switch (order.status) {
            case "Processing":
                order.status="Shipped";
                break;
            case "Shipped":
                order.status="Delivered";
                break;
            default:
                order.status="Delivered";
                break;
        }
        await order.save();
        invalidateCache({product:false,order:true,admin:true,userId:order.user,orderId:String(order._id)})
        return res.status(200).json({
            success:true,
            message:`Order ${order.status} Successfully`,
        })
    }
)


export const deleteOrder=TryCatch(
    async(req,res,next)=>{
        
        const {id} =req.params;
        const order = await Order.findById(id);
        if(!order){
            return next(new ErrorHandler("Order not found",404));
            }
        await order.deleteOne();
        invalidateCache({product:false,order:true,admin:true,userId:order.user,orderId:String(order._id)})
        return res.status(200).json({
            success:true,
            message:`Order deleted Successfully`,
        })
    }
)



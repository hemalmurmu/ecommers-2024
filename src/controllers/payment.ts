import { stripe } from "../app";
import { TryCatch } from "../middlewares/errorMiddleware";
import { Coupon } from "../models/coupan";
import ErrorHandler from "../utils/util-class";

export const createPaymentIntent=TryCatch(
    async(req,res,next)=>{

        const {amount} = req.body;
        if(!amount){
            return next(new ErrorHandler("Please Enter Amount",400))
        }

        const paymentIntent = await stripe.paymentIntents.create({amount:Number(amount)*100,currency:"inr"})
        return res.status(201).json({
            success:true,
            clientSecret:paymentIntent.client_secret,
        })
    }
)



export const newCoupon = TryCatch(
    async(req,res,next)=>{
        const {coupon,amount} = req.body;
        console.log(req.body)
        if(!coupon || !amount){
            return next(new ErrorHandler("Please enter Both The Code and Amount",400))
        }
        const couponle = await Coupon.create({coupon,amount});

        return res.status(201).json({
            success:true,
            message:"Coupon Creted Successfully",
            coupon:couponle
        })
    }
)



export const appplyDiscount = TryCatch(
    async(req,res,next)=>{
        const {coupon} = req.query;
        const code = String(coupon)
        const discount = await Coupon.findOne({coupon:code});
        if(!discount){
            return next(new ErrorHandler("Invalid Coupon Code",401))
        }

        return res.status(201).json({
            success:true,
            discount:discount.amount,
        })
    }
)


export const getallCoupons = TryCatch(
    async(req,res,next)=>{
        const coupons = await Coupon.find({});

        return res.status(201).json({
            success:true,
            coupons,
        })
    }
)


export const deleteCoupons = TryCatch(
    async(req,res,next)=>{
        const {id} = req.params;
        const coupon = await Coupon.findByIdAndDelete(id);
        if(!coupon){
            return next(new ErrorHandler("Invalid Coupon ID",400));
        }
        return res.status(201).json({
            success:true,
            message:`Coupon ${coupon} deleted successFully`,
        })
    }
)
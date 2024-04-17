import {Schema,model} from "mongoose";


const couponSchema = new Schema({
    coupon:{
        type:String,
        required:[true,"Please Enter The Cooupon Code"],
        unique:true,
    },
    amount:{
        type:Number,
        required:[true,"Please Enter The Disocubt Coupon"],
    }
})

export const Coupon = model("Coupon",couponSchema);
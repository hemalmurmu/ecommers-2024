import mongoose,{Schema, Types} from "mongoose";

const orderSchema = new Schema(
    {
        shippingInfo:{
            address:{
                type:String,
                required:true,
            },
            city:{
                type:String,
                required:true,
            },
            state:{
                type:String,
                required:true,
            },
            country:{
                type:String,
                required:true,
            },
            pincode:{
                type:Number,
                required:true,
            },
        },
        user:{
            type:String,
            ref:"User",
            required:true
        },
        subTotal:{
            type:Number,
            required:true,
        },
        tax:{
            type:Number,
            required:true,
        },
        shippingCharges:{
            type:Number,
            required:true,
            default:0
        },
        discount:{
            type:Number,
            required:true,
            default:0
        },
        total:{
            type:Number,
            required:true,
        },
        status:{
            type:String,
            enum:["Processing","Shipped","Delivered"],
            default:"Processing",
        },

        orderItems:[
            {
                name:String,
                photo:String,
                price:Number,
                quantity:Number,
                productId:{
                    type:Types.ObjectId,
                    ref:"Product",
                }

            }
        ]

    },
    {
        timestamps:true,
    }
)




export const Order = mongoose.model("Order",orderSchema);
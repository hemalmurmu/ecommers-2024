import mongoose,{Schema} from "mongoose";

const productSchema = new Schema(
    {

       name:{
            type: String,
            required: [true,"Please enter name"]
       },
       photo:{
        type: String,
        required: [true,"Please upload Photo"]
    },
    price:{
        type: Number,
        required: [true,"Please enter price"]
   },
   stock:{
    type: Number,
    required: [true,"Please enter Stock"]
    },
    category:{
        type: String,
        required: [true,"Please enter Catagory"],
        trim: true,
    },
    },
    {
        timestamps:true,
    }
)




export const Product = mongoose.model("Product",productSchema);
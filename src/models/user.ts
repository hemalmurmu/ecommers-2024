import mongoose, { Schema } from "mongoose";
import validator from "validator";



interface IUser extends Document{
    _id:string;
    name:string;
    photo:string;
    email:string;
    role:"admin" | "user";
    gander: "male" | "female";
    dob: Date;
    createdAt:Date;
    updatedAt:Date;
    // virtual attribute;
    age:number;
}

const userSchema = new Schema(
    {

        _id: {
            type: String,
            required: [true,"Please enter ID"]
        },
        photo: {
            type: String,
            required: [true,"Please enter Photo"]
        },
        name: {
            type: String,
            required:[true,"Please enter Name"],
        },
        email: {
            type: String,
            unique:["true","Email Already Exists"],
            required:[true,"Please enter Name"],
            validate: validator.default.isEmail,
        },
        role: {
            type: String,
            enum: ["admin","user"],
            default:"user"
        },
        gender: {
            type: String,
            enum: ["male","female"],
            required:[true,"Please enter Gender"],
        },
        dob: {
            type: Date,
            required:[true,"Please enter Date of Birth"],
        }

    },
    {
        timestamps:true,
    }
)

userSchema.virtual("age").get(function(){
    const today = new Date();
    const dob = this.dob;
    let age = today.getFullYear() - dob.getFullYear();

    if(today.getMonth()< dob.getMonth() || (today.getMonth()=== dob.getMonth()  && today.getDate()< dob.getDate())){
        age--
    }
    return age;
})


export const User = mongoose.model<IUser>("User",userSchema);
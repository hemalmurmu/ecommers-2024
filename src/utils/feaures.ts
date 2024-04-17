import mongoose from "mongoose"
import { InvalidateCacheProps, OrderItem } from "../types/types";
import { myChache } from "../app";
import { Product } from "../models/product";
import { Order } from "../models/order";

export const connectDb=(uri:string)=>{
    mongoose.connect(uri,{dbName:"Ecommers_Db"})
    .then((item)=> console.log(`DB connected to ${item.connection.host}`))
    .catch((error)=> console.log(error));
}


export const invalidateCache=({product,admin,order,userId,orderId,productId}:InvalidateCacheProps)=>{
    if(product){
        const productKeys:string[] =["latest-products","categories","all-products",];
        if(typeof productId === "string") productKeys.push(`product-${productId}`);

        if( typeof productId === "object"){
        productId.forEach((i) => productKeys.push(`product-${i}`));
    }

        myChache.del(productKeys);
    }
    if(order){
        const orderKeys:string[] = ["all-orders",`my-orders-${userId}`,`order-${orderId}`];
        myChache.del(orderKeys);
    }
    if(admin){
        myChache.del(["admin-stats","admin-pie-chart","admin-bar-charts","admin-line-charts"])
    }
}


export const reduceStock=async(orderItems:OrderItem[])=>{
    for(let i=0;i<orderItems.length;i++){
        const order = orderItems[i];
        const product = await Product.findById(order.productId);
        if(!product){
            throw new Error("Product not found")
        }

        product.stock -= order.quantity;
        await product.save();
    }
}

export const calculatePercentage=(thisMonth:number,lastMonth:number)=>{
    if(lastMonth===0){
        return thisMonth*100;
    }
    const percentage = (thisMonth/lastMonth)*100;
    return Number(percentage.toFixed(0));
}



export const getInventories=async({categories,productCount,}:{categories: string[]; productCount:number})=>{
    const categoryCountPromise = categories.map((category)=> Product.countDocuments({category}))

    const categoriesCount = await Promise.all(categoryCountPromise)

    const categoryCount:Record<string,number>[]=[];

    categories.forEach((category,i)=>{
        categoryCount.push({
            [category]:Math.round((categoriesCount[i]/productCount)* 100),
        })
    })

    return categoryCount;
}


interface MyDocument extends Document{
    createdAt:Date;
    discount:number;
    total:number;
}

type FuncProps={
    length:number,
    docArr:MyDocument[];
    today:Date;
    property?:"discount" | "total";
}


export const getBarData=({length,docArr,today,property}:FuncProps)=>{
 
    const data:number[]= new Array(length).fill(0);
    docArr.forEach((order)=>{
        const creationDate = order.createdAt;
        const monthDiff = (today.getMonth() - creationDate.getMonth()+12)%12;

        if(monthDiff<length){
            data[length-monthDiff-1]+= property ? order[property]:1;
        }
    })
    return data;         
                
}
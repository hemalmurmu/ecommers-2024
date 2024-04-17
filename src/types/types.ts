import { NextFunction, Request, Response } from "express";

export interface NewUserRequestBody {
    _id:string;
    name:string;
    photo:string;
    email:string;
    role:"admin" | "user";
    gender: "male" | "female";
    dob: Date;
}

export interface NewProductrRequestBody {
    name:string;
    category:string;
    stock:number;
    price:number;
}


export type ControllerType =(
    req: Request, 
    res: Response, 
    next: NextFunction) 
    => Promise<void | Response<any, Record<string, any>>>


export type SearchRequstQuery={
    search?:string;
    price?:string;
    category?:string;
    sort?:string;
    page?:string;

}

export interface BaseQuery{
    name?:{
        $regex:string,
        $options: string,
       };
    price?:{
        $lte:number,
    };
    category?:string
}


export interface InvalidateCacheProps{
    product?:boolean,
    order?:boolean,
    admin?:boolean,
    userId?:string,
    orderId?:string,
    productId?:string | string[],
}

export type OrderItem={
    name:string;
    photo:string;
    price:number;
    quantity:number;
    productId:string;
}


export type ShippingInfoType={
    address:string;
    city:string;
    state:string;
    country:string;
    pincode:number
}
export interface NewOrderRequestBody{
    shippingInfo:ShippingInfoType;
    user:string;
    subTotal:number;
    shippingCharges:number
    tax:number;
    discount:number;
    total:number;
    orderItems:OrderItem[];

}
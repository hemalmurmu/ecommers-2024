import { TryCatch } from "../middlewares/errorMiddleware";
import {Request} from "express"
import { BaseQuery,NewProductrRequestBody, SearchRequstQuery } from "../types/types.js";
import { Product } from "../models/product";
import ErrorHandler from "../utils/util-class";
import { rm } from "fs";
import {faker} from "@faker-js/faker"
import { myChache } from "../app";
import { invalidateCache } from "../utils/feaures";







export const getLatestProduct=TryCatch(
    async(req,res,next)=>{
        let products;
        if(myChache.has("latest-products")){
            products = JSON.parse(myChache.get("latest-products") as string);
        }else{
            products = await Product.find({}).sort({createdAt:-1}).limit(5);
        myChache.set("latest-products", JSON.stringify(products));
        }
        
        return res.status(201).json({
            success:true,
            products,
        })
    }
)


export const getAllCategories=TryCatch(
    async(req,res,next)=>{
        let categories;
        if(myChache.has("categories")){
            categories = JSON.parse(myChache.get("categories") as string)
        }else{
            categories = await Product.distinct("category")
            myChache.set("categories",JSON.stringify(categories))
        }
        
        return res.status(201).json({
            success:true,
            categories,
        })
    }
)

export const adminProducts=TryCatch(
    async(req,res,next)=>{
        let products;
        if(myChache.has("all-products")){
            products = JSON.parse(myChache.get("all-products") as string)
        }else{
            products = await Product.find({});
            myChache.set("all-products",JSON.stringify(products))
        } 

        console.log(products)
        return res.status(201).json({
            success:true,
            products,
        })
    }
)

export const getSingleProduct=TryCatch(
    async(req,res,next)=>{

        const id =req.params.id;

        let product;

        if(myChache.has(``)){
            product=JSON.parse(myChache.get(`product-${id}`) as string);
        }else{
            product = await Product.findById(id);
            if(!product){
                return next(new ErrorHandler("Product not found",404));
                }
            myChache.set(`product-${req.params.id}`,JSON.stringify(product))
        }
      
        
       
        return res.status(201).json({
            success:true,
            product,
        })
    }
)


export const newProduct=TryCatch(

    async(req:Request<{},{},NewProductrRequestBody>,res,next)=>{
        const {name,price,stock,category} = req.body;
        const photo = req.file;
        if(!photo){
            return next(new ErrorHandler("Please Add Photo",400));

        }
        
        if( !name || !price || !stock || !category){
            rm(photo.path,()=>{
                console.log("Photo Deleted..");
            })
            return next(new ErrorHandler("Please enter all fields",400))
        }
        await Product.create({
            name,
            price,
            stock,
            category: category.toLowerCase(),
            photo:photo?.path,
        });

        invalidateCache({product:true,admin:true});

        return res.status(201).json({
            success:true,
            message:"Product created successfully"
        })
    }
)






export const updateProduct=TryCatch(

    async(req,res,next)=>{
        const {id} = req.params;
        const {name,price,stock,category} = req.body;
        const photo = req.file;

        const product = await Product.findById(id);

        if(!product){
            return next(new ErrorHandler("Product not found",404));
        }
        if(photo){
            rm(product.photo,()=>{
                console.log("Old Photo Deleted");
            })
            product.photo = photo.path;
        }

        if(name) product.name = name;
        if(price) product.price = price;
        if(stock) product.stock = stock;
        if(category) product.category = category;
        
        await product.save();

        invalidateCache({product:true,productId:String(product._id),admin:true})

        return res.status(200).json({
            success:true,
            message:"Product updated successfully"
        })
    }
)


export const deleteProduct=TryCatch(
    async(req,res,next)=>{
      
       const product = await Product.findById(req.params.id);
       if(!product){
        return next(new ErrorHandler("Product not found",404));
       }
       rm(product.photo,()=>{
        console.log("Product Photo Deleted Successfully")
       })
       await product.deleteOne();
        invalidateCache({product:true,productId:String(product._id),admin:true})
        return res.status(201).json({
            success:true,
            message:"Product Deleted successfully"
        })
    }
)

// get products based in filters
export const getAllProducts=TryCatch(
    async(req:Request<{},{},{},SearchRequstQuery>,res,next)=>{
        const {search,sort,price,category} =req.query;
        
        const page = Number(req.query.page) || 1;
        const  limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
        const skip = limit*(page-1);
        const baseQuery:BaseQuery={}
        
        if(search){
            baseQuery.name={
                $regex:search,
                $options: "i",
            }
        }

        if(price){
            baseQuery.price={
                $lte : Number(price)
            }
        }

        
        if(category){
            baseQuery.category=category;
        }

       
        const productsPromise = await Product.find(baseQuery).sort(sort && {price:sort==="asc"? 1:-1}).limit(limit).skip(skip);


        const [products,filteredOnlyProducts] = await Promise.all([
            productsPromise,
            Product.find(baseQuery)
        ])


       const totalPages = Math.ceil( filteredOnlyProducts.length/limit)
       return res.status(201).json({
            success:true,
            products,
            totalPages
        })
    }
)


// const geberate=async(count:number=10)=>{
//     const products =[];
//     for(let i=0;i<count;i++){
//         const product={
//             name: faker.commerce.productName(),
//             photo:"uploads\\bab688be-46b7-43b9-8e09-67f199193016.PNG",
//             price:faker.commerce.price({min:1500,max:80000,dec:0}),
//             stock:faker.commerce.price({min:0,max:100,dec:0}),
//             category:faker.commerce.department(),
//             createdAt: new Date(faker.date.past()),
//             updatedAt:new Date(faker.date.recent()),
//             __v:0,
//         };
//         products.push(product);
//     }
//     await Product.create(products);


//     console.log({success:true});

// };











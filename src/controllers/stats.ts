import { myChache } from "../app";
import { TryCatch } from "../middlewares/errorMiddleware";
import { Order } from "../models/order";
import { Product } from "../models/product";
import { User } from "../models/user";
import { calculatePercentage, getBarData, getInventories } from "../utils/feaures";


export const getDashboardStats =TryCatch(
    async(req,res,next)=>{
        let stats;
        const key = "admin-stats";
         if(myChache.has(key)) stats = JSON.parse(myChache.get(key)as string)
         else{
            const today = new Date();
            const sixMonthAgo = new Date();

            sixMonthAgo.setMonth(sixMonthAgo.getMonth()-6);

            const thismonth={
                start:new Date(today.getFullYear(),today.getMonth(),1),
                end:today,
            }

            const lastMonth={
                start:new Date(today.getFullYear(),today.getMonth()-1,1),
                end:new Date(today.getFullYear(),today.getMonth(),0),
            }


            // const [] =

            const thisMonthProductsPromise = Product.find({
                createdAt:{
                    $gte:thismonth.start, $lte:thismonth.end
                }
            })

            const lastmonthProductsPromise = Product.find({
                createdAt:{
                    $gte:lastMonth.start, $lte:lastMonth.end
                }
            })




            const thisMonthUserPromise = User.find({
                createdAt:{
                    $gte:thismonth.start, $lte:thismonth.end
                }
            })


            const lastMonthUserPromise = User.find({
                createdAt:{
                    $gte:lastMonth.start, $lte:lastMonth.end
                }
            })



            // order
            const thisMonthOrdersPromise = Order.find({
                createdAt:{
                    $gte:thismonth.start, $lte:thismonth.end
                }
            })


            const lastMonthOrdersPromise = Order.find({
                createdAt:{
                    $gte:lastMonth.start, $lte:lastMonth.end
                }
            })



            // 
            const lastSixMonthOrderPromise = Order.find({
                createdAt:{
                    $gte:sixMonthAgo, $lte:today,
                }
            })


            const latestTransectionsPromise = Order.find({}).select(["orderItems","total","discount","status"]).limit(4)

            const [thisMonthProducts,thisMonthUsers,thisMonthOrders,lastMonthProducts,lastMonthUsers,lastmonthOrders,productCount,userCount,allOrders,lastSixMonthOrder,categories,femaleUserCount,latestTransaction] = await Promise.all([thisMonthProductsPromise,thisMonthUserPromise,thisMonthOrdersPromise,lastmonthProductsPromise,lastMonthUserPromise,lastMonthOrdersPromise,Product.countDocuments(),User.countDocuments(),Order.find({}).select("total"),lastSixMonthOrderPromise,Product.distinct("category"),User.countDocuments({gender:"female"}),latestTransectionsPromise])
            
            const thisMonthRevenu = thisMonthOrders.reduce((total,order)=> total+(order.total || 0),0)
            const lastMonthRevenu = lastmonthOrders.reduce((total,order)=> total+(order.total || 0),0)
            
            
            
            const percentChange={
                revenu:calculatePercentage(thisMonthRevenu,lastMonthRevenu),
                Product:calculatePercentage(thisMonthProducts.length,lastMonthProducts.length),
                user:calculatePercentage(thisMonthUsers.length,lastMonthUsers.length),
                order:calculatePercentage(thisMonthUsers.length,lastMonthUsers.length),
            }

            const revenue = allOrders.reduce((total,order)=> total+(order.total || 0),0)
            const counts={
                revenu:revenue,
                user:userCount,
                product:productCount  ,
                order:allOrders.length
            }

            const orderMonthCounts = new Array(6).fill(0);
            const orderMonthRevenue = new Array(6).fill(0);



            lastSixMonthOrder.forEach((order)=>{
                const creationDate = order.createdAt;
                const monthDiff = (today.getMonth() - creationDate.getMonth()+12)%12;

                if(monthDiff<6){
                    orderMonthCounts[6-monthDiff-1]+=1;
                    orderMonthRevenue[6-monthDiff-1]+=order.total;
                }
            })


            const categoryCount=await getInventories({categories,productCount});

            const genderRatio={
                male: userCount-femaleUserCount,
                female: femaleUserCount,
            }

            const modifiedTransactions = latestTransaction.map((i)=>({
                _id:i._id,
                discount:i.discount,
                amount:i.total,
                quantity:i.orderItems.length,
                status:i.status,

            }))

            stats={
                categoryCount,
               percentChange,
               counts,
               charts:{
                order: orderMonthCounts,
                revenue: orderMonthRevenue,

            },
            genderRatio,
            lastestTransaction:modifiedTransactions
            }



            myChache.set(key,JSON.stringify(stats))
        }





        return res.status(200).json({
            success:true,
            stats,
            
        })

    }

    
)


export const getPieCharts =TryCatch(
    async(req,res,next)=>{
        const key = "admin-pie-chart"
        let charts;
        if(myChache.has(key)){
            charts = JSON.parse(myChache.get(key) as string)
        }else{



            const [processingOrderCount,shippedOrderCount,deliveredOrderCount,categories,productCount,outOfStock,allOrders,allUsers,adminUsers,customerUsers] = await Promise.all([Order.countDocuments({status:"Processing"}),Order.countDocuments({status:"Shipped"}),Order.countDocuments({status:"Delivered"}),Product.distinct("category"),Product.countDocuments(),Product.countDocuments({stock:0}),Order.find({}).select(["total","discount","subTotal","shippingCharges","tax"]),User.find({}).select(["dob"]),User.countDocuments({role:"admin"}),User.countDocuments({role:"user"})])
            
            
            const orderFullfillment={
                processing:processingOrderCount,
                shipped:shippedOrderCount,
                delivered:deliveredOrderCount
            }


            const productsCategories:Record<string,number>[]=await getInventories({categories,productCount});

            const stockAvailability={
                inStock: productCount-outOfStock,
                outOfStock,
            }

            const grossIncome = allOrders.reduce((prev,order)=> prev+(order.total || 0),0)
            const  discount= allOrders.reduce((prev,order)=> prev+(order.discount || 0),0)
            const productionCost = allOrders.reduce((prev,order)=> prev+(order.shippingCharges || 0),0)
            const burn = allOrders.reduce((prev,order)=> prev+(order.tax || 0),0)
            const marketingCost = Math.round(grossIncome*(30/100))
            const netMargin = grossIncome-discount-burn-productionCost-marketingCost



            const revenueTistribution ={
                netMargin,
                discount,
                productionCost,
                burn,
                marketingCost,
            }


            const adminCustomer={
                admin:adminUsers,
                customers:customerUsers
            }


            const userAgeGroup={
                teen:allUsers.filter(i=> i.age<20).length,
                adult:allUsers.filter(i=> i.age>20 && i.age<40).length,
                old:allUsers.filter(i=> i.age>=40).length,
            }
            

            charts ={
                orderFullfillment,
                productsCategories,
                stockAvailability,
                revenueTistribution,
                adminCustomer,
                userAgeGroup
            };

            myChache.set(key,JSON.stringify(charts))

        }
        
        return res.status(200).json({
            success:true,
            charts,
            
        })

    }
)



export const getBarCharts =TryCatch(
    async(req,res,next)=>{

        const key = "admin-bar-charts";
        let charts;
        if(myChache.has(key)){
            charts = JSON.parse(myChache.get(key) as string)
        }else{

            const today = new Date();
            const sixMonthAgo = new Date();

            sixMonthAgo.setMonth(sixMonthAgo.getMonth()-6);



            const twelveMonthAgo = new Date();

            twelveMonthAgo.setMonth(twelveMonthAgo.getMonth()-12);


            const lastSixmonthProductsPromise = Product.find({
                createdAt:{
                    $gte:sixMonthAgo, $lte:today
                }
            }).select("createdAt")

            const lastSixmonthUsersPromise = User.find({
                createdAt:{
                    $gte:sixMonthAgo, $lte:today
                }
            }).select("createdAt")

            const lastTwelvemonthOrderesPromise = Order.find({
                createdAt:{
                    $gte:twelveMonthAgo, $lte:today
                }
            }).select("createdAt")


            const [product,users,orders]= await Promise.all([
                lastSixmonthProductsPromise,
                lastSixmonthUsersPromise,
                lastTwelvemonthOrderesPromise,
            ])
            // product:MyDocument[]
            const productCount = getBarData({length:6,docArr:product,today})
            const usersCount = getBarData({length:6,docArr:users,today})
            const orderCount = getBarData({length:12,docArr:orders,today})









            charts={
                users:usersCount,
                products:productCount,
                orders:orderCount,
            }

            myChache.set(key,JSON.stringify(charts));

        }

        return res.status(200).json({
            success:true,
            charts,
            
        })
        
    }
)



export const getLineCharts =TryCatch(
    async(req,res,next)=>{
        const key = "admin-line-charts";
        let charts;
        if(myChache.has(key)){
            charts = JSON.parse(myChache.get(key) as string)
        }else{

            const today = new Date();

            const twelveMonthAgo = new Date();

            twelveMonthAgo.setMonth(twelveMonthAgo.getMonth()-12);


            const lastTwelvemonthOrderesPromise = Order.find({
                createdAt:{
                    $gte:twelveMonthAgo, $lte:today
                }
            }).select(["createdAt","discount","total"])


            const lastTwelvemonthProductsPromise = Product.find({
                createdAt:{
                    $gte:twelveMonthAgo, $lte:today
                }
            }).select("createdAt")
            const lastTwelvemonthUsersPromise = User.find({
                createdAt:{
                    $gte:twelveMonthAgo, $lte:today
                }
            }).select("createdAt")


            const [product,users,orders]= await Promise.all([
                lastTwelvemonthProductsPromise,
                lastTwelvemonthUsersPromise,
                lastTwelvemonthOrderesPromise,
            ])
            const productCount = getBarData({length:12,docArr:product,today})
            const usersCount = getBarData({length:12,docArr:users,today})
            const discount = getBarData({length:12,docArr:orders,today,property:"discount"})
            const revenu = getBarData({length:12,docArr:orders,today,property:"total"})









            charts={
                users:usersCount,
                products:productCount,
                discount,
                revenu
            }

            myChache.set(key,JSON.stringify(charts));

        }

        return res.status(200).json({
            success:true,
            charts,
            
        })
        
    }
)
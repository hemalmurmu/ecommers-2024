import express from "express";
import userRoute from "./routes/user.js"
import productRoute from "./routes/product.js"
import orderRouter from "./routes/order.js"
import paymentRoute from "./routes/payment.js"
import statsRoute from "./routes/stats.js"
import { connectDb } from "./utils/feaures.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import NodeCache from "node-cache"
import {config} from "dotenv";
import cors from "cors"

import morgan from "morgan"
import Stripe from "stripe";


config({
    path:"./.env",
})


const port = process.env.PORT || 8000;
const mongoURI = process.env.MONGO_URI || "";
const stripeKey = process.env.STRIPE_KEY || "";


connectDb(mongoURI);

export const stripe = new Stripe(stripeKey)
export const myChache = new NodeCache();



const app = express();




app.use(express.json());
app.use(morgan("dev"));
app.use(cors())


app.get("/",(req,res)=>{
    res.send("Welcome home");
})


// useing Routes
app.use("/api/v1/user",userRoute);
app.use("/api/v1/product",productRoute);
app.use("/api/v1/order",orderRouter)
app.use("/api/v1/payment",paymentRoute)
app.use("/api/v1/dashboard",statsRoute)

app.use("/uploads",express.static("uploads"))
app.use(errorMiddleware)



app.listen(port,()=>{
    console.log(`Server is working on http://localhost:${port}`)
})
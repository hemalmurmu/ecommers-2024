import express from "express";
import { appplyDiscount, createPaymentIntent, deleteCoupons, getallCoupons, newCoupon } from "../controllers/payment";
import { adminOnly } from "../middlewares/auth";


const app = express.Router()



app.post("/create",createPaymentIntent)

app.get("/discount",appplyDiscount)

app.post("/coupon/new",adminOnly,newCoupon)


app.get("/coupon/all",adminOnly,getallCoupons)
app.delete("/coupon/:id",adminOnly,deleteCoupons)

export default app;
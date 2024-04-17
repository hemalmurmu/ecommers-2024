import express,{Router} from "express";
import { allOrders, deleteOrder, getSingleOrder, myOrders, newOrder, processOrder } from "../controllers/order";
import { adminOnly } from "../middlewares/auth";


const app = Router();



app.post("/new",newOrder);
app.get("/my",myOrders);
app.get("/all",adminOnly,allOrders);
app.route("/:id").get(getSingleOrder).put(adminOnly,processOrder).delete(adminOnly,deleteOrder);


export default app;
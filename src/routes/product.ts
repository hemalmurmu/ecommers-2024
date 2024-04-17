import express from "express"
import { adminOnly } from "../middlewares/auth";
import { adminProducts, deleteProduct, getAllCategories, getAllProducts, getLatestProduct, getSingleProduct, newProduct, updateProduct } from "../controllers/product";
import { singleUpload } from "../middlewares/multer";


const app = express.Router()

app.post("/new",adminOnly,singleUpload,newProduct);
app.get("/latest",getLatestProduct);
app.get("/categories",getAllCategories)


app.get("/all",getAllProducts)


app.get("/admin-products",adminOnly,adminProducts)


app.route("/:id").get(getSingleProduct).put(adminOnly,singleUpload,updateProduct).delete(adminOnly,deleteProduct)

export default app;
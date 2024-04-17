import express from "express"
import { deleteUser, getAllUser, getAllUsers, newUser } from "../controllers/user";
import { adminOnly } from "../middlewares/auth";


const app = express.Router()

app.post("/new",newUser);
app.get("/all",adminOnly,getAllUsers)
app.get("/:id",getAllUser)
app.delete("/:id",adminOnly,deleteUser)

export default app;
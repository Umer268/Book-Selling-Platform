import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import connectDB from './config/db.js'
import authRoutes from './route/authRoute.js'
import cartRoute from './route/cartRoute.js'
import { auth } from './middleware/authMiddleware.js';
import bookRoute from './route/bookRoute.js'
import orderRoute from './route/orderRoute.js'
import paymentRoute from './route/paymentRoute.js'
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
await connectDB();

app.use(express.json());
app.use(express.urlencoded({extended:true}));


//routes
app.use("/api/auth", authRoutes);
app.use("/api/books",bookRoute);
app.use("/api/cart",cartRoute)
app.use("/api/orders",orderRoute)
app.use("/api/payment",paymentRoute)
app.get("/me",auth,(req,res)=>{
    res.send("Hello from umer");
})
//error handling middleware
app.use((err, req, res, next) => {
    return res.status(400).json({
        success:false,
        message:err.message
    });
});
app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})
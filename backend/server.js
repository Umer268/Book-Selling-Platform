import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import connectDB from './config/db.js'
import authRoutes from './route/authRoute.js'
import cartRoute from './route/cartRoute.js'
import { auth } from './middleware/authMiddleware.js';
import bookRoute from './route/bookRoute.js'

const app = express();
const port = process.env.PORT || 3001;

await connectDB();

app.use(express.json());
app.use(express.urlencoded({extended:true}));


//routes
app.use("/api/auth", authRoutes);
app.use("/api/books",bookRoute);
app.use("/api/cart",cartRoute)
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
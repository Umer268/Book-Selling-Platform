import express from 'express';
import connectDB from './config/db.js'
import authRoutes from './route/authRoute.js'
import { auth } from './middleware/authMiddleware.js';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

connectDB();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/api/auth', authRoutes);

app.get("/me",auth,(req,res)=>{
    res.send("Hello from umer");
})

app.listen(port,(req,res)=>{
    console.log(`server is running on port ${port}`)
})
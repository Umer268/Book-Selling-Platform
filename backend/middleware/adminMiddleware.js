import mongoose from "mongoose";

export const admin = (req,res,next)=>{

    if(!req.user || req.user.role!="admin"){
        return res.status(403).json({
            success:false,
            message:"Access Denied"
        })
    }
    next()
}
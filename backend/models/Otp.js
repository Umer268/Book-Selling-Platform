import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    mobileNumber :{
        type:String,
        required:true,
    },
    otpHash:{
        type:String,
        required:true
    },
    purpose:{
        type:String,
        enum:["signup","resetPassword"],
        required:true
    },
    expiresAt:{
        type:Date,
        required:true,
        expires : 0 
    }
})

const Otp = mongoose.model("Otp",otpSchema);

export default Otp;
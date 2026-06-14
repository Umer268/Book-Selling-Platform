import express from "express"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";

export const sendSignupOtp = async (req,res)=>{
    
    try{
    
    const {mobileNumber} = req.body;
    if(!mobileNumber){
        return res.status(400).json({
            success:false,
            message:"Mobile number is required"
        })
    }
    const existingUser = await User.findOne({
        mobileNumber
    })
    if(existingUser){
        return res.status(400).json({
            success:false,
            message:"User already exists"
        })
    }

    await Otp.deleteOne({
        mobileNumber,
        purpose:"signup"
    });

    const otp = (Math.floor(100000+Math.random()*900000)).toString()

    const otpHash = await bcrypt.hash(otp,10);

    await Otp.create({
        mobileNumber,
        otpHash,
        purpose:"signup",
        expiresAt: new Date(
            Date.now()+5*60*1000
        )
    })

    console.log("Your Otp is :",otp)

    return res.status(200).json({
        success:true,
        message:"Otp sent Successfully"
    })
}
catch(err){
    console.log("Internal error in sending otp")
    return res.status(500).json({
        success:false,
        message:"Internal error in sending otp"
    })
}
}

export const registerUser  = async (req,res)=>{
    try{
const {
     username,
     mobileNumber,
     otp,
     password
 } = req.body;

 if(!username || !mobileNumber || !otp || !password){
     return res.status(400).json({
         success:false,
         message:"All fields are required"
     })
 }
 const existingUser = await User.findOne({
     mobileNumber
 })
 
 if(existingUser){
     return res.status(400).json({
         success:false,
         message:"User already exists"
     })
 }
 
 const otpDoc = await Otp.findOne({
     mobileNumber,
     purpose:"signup"
 })
 if(!otpDoc){
     return res.status(400).json({
         success:false,
         message:"Otp not found"
     })
 }
 if(otpDoc.expiresAt<new Date()){
     await Otp.deleteOne({
         _id:otpDoc._id
     })
     return res.status(400).json({
         success:false,
         message:"Otp expired"
     })
 }
 const validOtp = await bcrypt.compare(otp,otpDoc.otpHash);

 if(!validOtp){
     return res.status(400).json({
         success:false,
         message:"Invalid Otp"
     })
 }
 const hashedPass = await bcrypt.hash(password,10);

 const user = await User.create({
    username,
    mobileNumber,
    password:hashedPass,
    isVerified:true
 })

 await Otp.deleteOne({
     _id:otpDoc._id
 })

 const token = jwt.sign(
     {
         userId:user._id,
         role:user.role
     },
     process.env.JWT_SECRET,
     {
         expiresIn:"1d"
     }
 );
 return res.status(201).json({
     success:true,
     message:"Signup Successfully",
     token
 })
    
}catch(err){
    console.log(err);
    return res.status(500).json({
        success:false,
        message:"Internal server error"
    })
}
};

export const loginUser = async (req,res)=>{
    try{
    const {mobileNumber,password} = req.body;

    if(!mobileNumber || !password){
        return res.status(400).json({
            success:false,
            message:"All field are required"
        })
    }
    const existingUser = await User.findOne({
        mobileNumber
    })

    if(!existingUser){
        return res.status(401).json({
            success:false,
            message:"Invalid credentials"
        })
    }

    const validUser = await bcrypt.compare(password,existingUser.password)

    if(!validUser){
        return res.status(401).json({
            success:false,
            message:"Invalid credentials"
        })
    }
    const token = jwt.sign({
        userId:existingUser._id,
        role:existingUser.role
    },
    process.env.JWT_SECRET,
    {
        expiresIn:"1d"
    }
    )
    return res.status(200).json({
        success:true,
        message:"Login Successfully",
        token,
        user:{
        id: existingUser._id,
        username:existingUser.username,
        mobileNumber:existingUser.mobileNumber,
        role:existingUser.role
        }
    })
}catch(err){
    console.log("error in login",err.message)
    return res.status(500).json({
        success:false,
        message:"Internal server error"
    })
}
};

export const sendResetOtp = async (req,res)=>{
    try{
     
    const {mobileNumber} = req.body;

    if(!mobileNumber){
        return res.status(400).json({
            success:false,
            message:"Mobile number is required"
        })
    }

    const existingUser = await User.findOne({
        mobileNumber
    })
    if(!existingUser){
        return res.status(404).json({
            success:false,
            message:"User does not exists"
        })
    }

    await Otp.deleteMany({
        mobileNumber,
        purpose:"resetPassword"
    })

    const otp = (Math.floor(100000+Math.random()*900000)).toString()
    
    const otpHash = await bcrypt.hash(otp,10)
    await Otp.create({
        mobileNumber,
        otpHash,
        purpose:"resetPassword",
        expiresAt:new Date(
            Date.now()+5*60*1000
        )   
    })
    console.log("Otp is :",otp)

    return res.status(200).json({
        success:true,
        message:"OTP sent successfully"
    })
    }catch(err){
        console.log("Error in sending otp for reset password : ",err.message)
        return res.status(500).json({
        success:false,
        message:"Internal server Error"
       })
    }

};

export const resetPassword = async (req,res)=>{
    try{
    const {mobileNumber,otp,password} = req.body;

    if(!mobileNumber || !otp || !password){
        return res.status(400).json({
            success:false,
            message:"All fields are required"
        })
    }

    const existingUser = await User.findOne({
        mobileNumber
    })
    
    if(!existingUser){
        return res.status(404).json({
            success:false,
            message:"User does not exists"
        })
    }

    const otpDoc = await Otp.findOne({
        mobileNumber,
        purpose:"resetPassword"
    })

    if(!otpDoc){
        return res.status(404).json({
            success:false,
            message:"Otp not found"
        })
    }
    
    if(otpDoc.expiresAt<Date.now()){
            await Otp.deleteOne({
            _id:otpDoc._id
            })
            return res.status(400).json({
                success:false,
                message:"Otp is expired"
            })
    }
    const isValidOtp = await bcrypt.compare(
        otp,
        otpDoc.otpHash
    );

    if(!isValidOtp){
        return res.status(400).json({
            success:false,
            message:"Invalid Otp"
        })
    }

    const hashedPass = await bcrypt.hash(password,10);
    
    await User.updateOne(
        {
            mobileNumber
        },
        {
            $set:{password:hashedPass}
        }
    )

    await Otp.deleteMany({
        mobileNumber,
        purpose:"resetPassword"
    })

        return res.status(200).json({
            success:true,
            message:"Password updated successfully"
        })
    }catch(err){
        console.log("error in forgot password :",err.message)
        return res.status(500).json({
            success:false,
            message:"Internal Server error"
        })
    }
}


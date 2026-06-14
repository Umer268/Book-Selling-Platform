import express from "express";
import rateLimit from "express-rate-limit"

export const otpLimiter = rateLimit({
    windowMs:1000*60*5,
    max:3,
    standardHeaders:true,
    legacyHeaders:false,

    message:{
        success:false,
        message:"Too many otp requests , Please try again later"

    }
})

export const loginLimiter = rateLimit({
    windowMs : 20*60*1000,
    max:3,
    legacyHeaders:false,
    standardHeaders:true,

    message:{
        success:false,
        message:"Too many login requests, Please try again later"
    }
})
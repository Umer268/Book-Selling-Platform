import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    username:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true
    },
    mobileNumber:{
        type:String,
        required:true,
        unique:true
    },
    address:[{
        fullname:String,
        phone:String,
        street:String,
        city:String,
        state:String,
        pinCode:String
    }],
    isVerified:{
        type:Boolean,
        default : false
    },
    role :{
        type:String,
        enum:["user","admin"],
        default:"user"
    }
});

const User = mongoose.model('User',userSchema)
export default User;
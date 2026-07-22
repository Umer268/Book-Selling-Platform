import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    items:[
        {
        book:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Book",
            required:true
        },
        title:{
            type:String,
            required:true
        },
        price:{
            type:Number,
            required:true,
            min:0

        },
        quantity:{
            type:Number,
            required:true,
            min:1
        }
    }
    ],
    shippingAddress:{
        fullName:{
            type:String,
            required:true
        },
        phone:{
            type:String,
            required:true
        },
        street :{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        pinCode:{
            type:String,
            required:true
        },
    },
    totalAmount:{
        type:Number,
        required:true,
        min:0
    },
    paymentId:{
        type:String,
        default:null
    },
    paymentMethod:{
        type:String,
        enum:["COD","ONLINE"],
        required:true
    },
    paymentStatus:{
        type:String,
        enum:["Pending","Paid","Failed"],
        default:"Pending"
    },
    razorpayOrderId: {
    type: String,
    default: null
    },
    orderStatus:{
        type:String,
        enum:["Pending","Processing","Shipped","Delivered","Cancelled"],
        default:"Pending"
    },
    deliveredAt:{
        type:Date,
        default:null
    },
    cancelledAt:{
        type:Date,
        default:null
    }
},{
    timestamps : true
})

const Order = mongoose.model("Order",orderSchema);

export default Order;
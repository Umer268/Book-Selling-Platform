import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    author:{
        type:String,
        required:true,
        trim:true
    },
    image:{
        url:{
            type:String,
            required:true
        },
        publicId:{
            type:String,
            required:true
        }
    },
    originalPrice:{
        type:Number,
        required:true,
        min:0
    },
    discountedPrice:{
        type:Number,
        required:true,
        min:0
    },
    description:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
        trim:true
    },
    stock:{
        type:Number,
        require:true,
        default:0,
        min:0
    },
    averageRatings:{
        type:Number,
        default:0
    },
    totalReviews:{
        type:Number,
        default:0
    }
},{
    timestamps:true
});

const Book = mongoose.model("Book",bookSchema);

export default Book;
import mongoose from 'mongoose'
import Cart from '../models/Cart.js';
import Book from '../models/Book.js';
export const createCartItem = async (req,res) => {
    try{
    const {bookId,quantity=1} = req.body;
    if(!mongoose.Types.ObjectId.isValid(bookId)){
        return res.status(400).json({
            success:false,
            message:"Send Proper Id"
        })
    }
    if(quantity<1){
        return res.status(400).json({
            success:false,
            message:"Quantity must be atleast 1"
        })
    }
    const book = await Book.findById(bookId);

    if (!book) {
        return res.status(404).json({
            success:false,
            message:"Book not found"
        });
    }
    const existingBook = await Cart.findOne({
        user:req.user.userId,
        "items.book":bookId
    })
    if(existingBook){
        const existingCartItem =  await Cart.findOneAndUpdate(
        {
        user:req.user.userId,
        "items.book": bookId
        },
        {
            $inc:{
                "items.$.quantity": quantity
            }
        },{
            new:true,
        }
   )

   return res.status(200).json({
    success:true,
    message:"Book added to cart successfully",
    existingCartItem
   })
    }

   const bookCart =  await Cart.findOneAndUpdate(
        {user:req.user.userId},
        {
            $push:{
                items:{
                    book:bookId,
                    quantity:quantity
                }
            }
        },{
            new:true,
            upsert:true
        }
   )

   return res.status(201).json({
    success:true,
    message:"Book added to cart successfully",
    bookCart
   })
}catch(err){
    console.log(err.message);
    return res.status(500).json({
        success:false,
        message:"Internal Server Error"
    })
}

}

export const getCartItems = async (req,res) =>{
    try{
    const carts = await Cart.findOne(
        {
        user:req.user.userId
        }
    ).populate("items.book");
    
    if (!carts) {
            return res.status(200).json({
            success: true,
             message: "Cart is empty",
                cart: {
                  items: []
                  }
            });
        }
    return res.status(200).json({
        success:true,
        message:"Get all cart items",
        cart:carts
    })
}catch(err){
    console.log(err.message);
    return res.status(500).json({
        success:false,
        message:"Internal Server Error"
    })
}
}

export const updateBookQuantity = async (req,res)=>{
    try{

    const {quantity} = req.body;
    const {bookId} = req.params
    if(!mongoose.Types.ObjectId.isValid(bookId)){
        return res.status(400).json(
          {
            success:false,
            message:"Book id is not valid "
          }
        )
    }
    if(quantity<1) {
        return res.status(400).json({
            success:false,
            message:"Quantity must be atleast 1"
        })
    }

    const updatedCart = await Cart.findOneAndUpdate({
        user :req.user.userId,
        "items.book":bookId
    },{
        $set:{
            "items.$.quantity":quantity
        }
    },{
        returnDocument:'after'
    })
    if(!updatedCart){
        return res.status(404).json({
            success:false,
            message:"Book is not in the cart"
        })
    }
    return res.status(200).json({
        success:true,
        message:"Quantity updated successfully",
        cart:updatedCart
    })
}catch(err){
    console.log(err.message);
    return res.status(500).json({
        success:false,
        message:"Internal server error"
    })
}
}

export const deleteSingleCartItem = async (req,res) =>{
    try{
    const {bookId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(bookId)){
        return res.status(400).json({
            success:false,
            message:"Invalid Book Id"
        })
    }
    const cart = await Cart.findOne({
        user:req.user.userId,
        "items.book":bookId
    })
    if (!cart) {
    return res.status(404).json({
        success: false,
        message: "Book doesn't exist in cart"
    });
}
    const deletedCartItem = await Cart.findOneAndUpdate({
        user:req.user.userId,
    },{
        $pull: {
            items: {
                book: bookId
            }
        }
    },{
        returnDocument:'after'
    })
    return res.status(200).json({
        success:true,
        message:"Book Deleted Successfully",
        cart : deletedCartItem
    })
}catch(err){
    console.log(err.message);
    return res.status(500).json({
        success:false,
        message:"Internal server error"
    })
}
}

export const deleteCart = async (req,res)=>{
    try{
    const user = req.user.userId;

    const deletedCartItem = await Cart.findOneAndUpdate({
        user
    },{
        $set:{
            items:[]
        }
    },{
        returnDocument:'after'
    })
    if (!deletedCartItem) {
    return res.status(404).json({
        success: false,
        message: "Cart not found",
        cart : deletedCartItem
    });
}
    return res.status(200).json({
        success:true,
        message:"Cart Deleted Successfully"
    })
}catch(err){
    console.log(err.message);
    return res.status(500).json({
        success:false,
        message:"Internal server error"
    })
}
}
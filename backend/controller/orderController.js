import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

export const placeOrder = async (req,res) => {
    try{
    let userId = req.user.userId;
    const {addressIndex,paymentMethod} = req.body;
    
    if(!["COD", "ONLINE"].includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method"
        });
    }
    // I am checking whether user exist or not
    const user = await User.findById(userId);

    if(!user){
        return res.status(404).json({
            success:false,
            message:"User not found"
        })
    }

    // Validating address

    if(addressIndex<0 || user.address.length<=addressIndex){
        return res.status(400).json({
            success:false,
            message:"Invalid address selected"
        })
    }
    // get cart 
    const cart = await Cart.findOne({
        user:userId,
    }).populate("items.book");

    // checking whether cart is empty or not
    if(!cart || cart.items.length === 0) return res.status(400).json({
        success:false,
        message:"Cart is Empty"
    })
    // checking all book exist or not
    const invalidBook = cart.items.find(item => !item.book);

    if (invalidBook){
        return res.status(400).json({
        success: false,
        message: "One or more books in the cart no longer exist."
        });
    }
    // Creating order list from cart 
    const orderItems = cart.items.map(item=>({
        book : item.book._id,
        title:item.book.title,
        price:item.book.discountedPrice,
        quantity:item.quantity
    }))
    // calculate totalAmount
    let totalAmount = 0;
    for(let i = 0;i<orderItems.length;i++){
        let item = orderItems[i];
        totalAmount += item.price * item.quantity;
    }

    const selectedAddress = user.address[addressIndex];
    // create order
    const order = await Order.create({
        user:userId,
        items:orderItems,
        shippingAddress:{
            fullName: selectedAddress.fullname,
            phone: selectedAddress.phone,
            street: selectedAddress.street,
            city: selectedAddress.city,
            state: selectedAddress.state,
            pinCode: selectedAddress.pinCode
        },
        totalAmount,
        paymentMethod
    })
    if (paymentMethod === "COD") {

        await Cart.findOneAndUpdate(
            { user: userId },
            {
                $set: {
                     items: []
                    }
                }
            );

            return res.status(201).json({
                success: true,
                message: "Order placed successfully",
                order
        });
    }
    return res.status(201).json({
        success:true,
        message:"Order created successfully",
        order
    })
}catch(err){
    console.log(err);
    return res.status(500).json({
        success:false,
        message:"Internal server error",
    });
}
}
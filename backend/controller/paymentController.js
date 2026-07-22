import razorpay from "../config/razorpay.js";
import Order from "../models/Order.js";
import mongoose from "mongoose"
import crypto from "crypto";
export const createRazorpayOrder = async (req, res) => {
    try {
        const {orderId} = req.body;
        if(!orderId){
            return res.status(400).json({
                success:false,
                message:"Order Id is required"
            })
        }
         if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
            success: false,
            message: "Invalid Order Id"
         });
        }
        const order = await Order.findById(orderId);

        if(!order){
            return res.status(404).json({
                success:false,
                message:"Order not found"
            })
        }
        if(order.user.toString() !== req.user.userId){
            return res.status(403).json({
                success:false,
                message:"Unauthorized user"
            })
        }

        if(order.paymentMethod === "COD"){
            return res.status(400).json({
                success:false,
                message:"Invalid Payment method"
            })
        }
        if (order.paymentStatus === "Paid") {
            return res.status(400).json({
              success: false,
              message: "Order has already been paid"
         });
    }

        if(order.razorpayOrderId) {
            return res.status(200).json({
                success: true,
                message: "Razorpay order already created",
                razorpayOrder: {
                  id: order.razorpayOrderId,
                  amount: order.totalAmount * 100,
                  currency: "INR"
                 },
                orderId: order._id
            });
        }
        const options = {
            amount: order.totalAmount * 100,
            currency: "INR",
            receipt: order._id.toString()
        };
        const razorpayOrder = await razorpay.orders.create(options);
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();
        return res.status(200).json({

            success: true,
            message: "Razorpay order created successfully",
            razorpayOrder,
            orderId: order._id
    });
    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};


export const verifyPayment = async (req, res) => {
    try {

        const {
            orderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // Validate input
        if (
            !orderId ||
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing required payment details"
            });
        }

        // Validate MongoDB Order Id
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Order Id"
            });
        }

        // Find Order
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Check ownership
        if (order.user.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized user"
            });
        }

        // Already paid?
        if (order.paymentStatus === "Paid") {
            return res.status(400).json({
                success: false,
                message: "Order already paid"
            });
        }

        // Verify Razorpay Order Id
        if (order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({
                success: false,
                message: "Invalid Razorpay Order"
            });
        }

        // Generate Signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        // Compare Signature
        if (generatedSignature !== razorpay_signature) {

            order.paymentStatus = "Failed";
            await order.save();

            return res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });
        }

        // Payment Successful
        order.paymentStatus = "Paid";
        order.paymentId = razorpay_payment_id;

        await order.save();

        // Clear Cart
        await Cart.findOneAndUpdate(
            { user: req.user.userId },
            {
                $set: {
                    items: []
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            order
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};
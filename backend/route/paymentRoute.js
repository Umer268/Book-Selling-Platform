import express from 'express'
import { createRazorpayOrder,verifyPayment } from '../controller/paymentController.js';
import { auth } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post("/create-order", auth, createRazorpayOrder);
router.post("/verify", auth, verifyPayment);

export default router;
import express from 'express'
import { placeOrder } from '../controller/orderController.js';
import { auth } from '../middleware/authMiddleware.js';

const router = express.Router();


router.post("/",auth,placeOrder)

export default router;
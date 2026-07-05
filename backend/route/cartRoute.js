import express from 'express'
import { auth } from '../middleware/authMiddleware.js'
import { createCartItem , getCartItems} from '../controller/cartController.js';

const router = express.Router()

router.post("/",auth,createCartItem);
router.get("/",auth,getCartItems)

export default router;
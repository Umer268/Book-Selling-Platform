import express from 'express'
import { auth } from '../middleware/authMiddleware.js'
import { createCartItem , deleteCart, deleteSingleCartItem, getCartItems, updateBookQuantity} from '../controller/cartController.js';

const router = express.Router()

router.post("/",auth,createCartItem);
router.get("/",auth,getCartItems);
router.put("/:bookId",auth,updateBookQuantity);
router.delete("/:bookId",auth,deleteSingleCartItem)
router.delete("/",auth,deleteCart)
export default router;
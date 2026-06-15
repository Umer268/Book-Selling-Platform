import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import  {createBook, deleteBook, getBooks, getBookById, updateBook } from "../controller/bookController.js";

const router = express.Router();

router.post("/",auth,admin,createBook)
router.get("/",getBooks)
router.get("/:id",getBookById)
router.put("/:id",auth,admin,updateBook)
router.delete("/:id",auth,admin,deleteBook)
export default router;
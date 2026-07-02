import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import {upload} from "../middleware/uploadMiddleware.js"
import  {createBook, deleteBook, getBooks, getBookById, updateBook } from "../controller/bookController.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
const router = express.Router();

router.post("/",auth,admin,upload.single("image"),createBook)
router.get("/",getBooks)
router.get("/:id",getBookById)
router.put("/:id",auth,admin,upload.single("image"),updateBook)
router.delete("/:id",auth,admin,deleteBook)
export default router;
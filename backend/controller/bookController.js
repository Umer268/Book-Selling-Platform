import mongoose from "mongoose";
import Book from "../models/Book.js";

export const createBook = async (req, res) => {
  try{
    const {
    title,
    author,
    image,
    originalPrice,
    discountedPrice,
    description,
    category,
    stock,
  } = req.body;

  if (
    !title ||
    !author ||
    !image ||
    originalPrice == null||
    discountedPrice == null ||
    !description ||
    !category ||
    stock ==null
  ) {
     return res.status(400).json({
        success:false,
        message: "All field are required"
     });

  }

  if(discountedPrice > originalPrice){
   return res.status(400).json({
       success:false,
       message:"Discounted price cannot exceed original price"
   });
  }
  const book = await Book.create({
    title,
    author,
    image,
    originalPrice,
    discountedPrice,
    description,
    category,
    stock,
  })

  return res.status(201).json({
    success:true,
    message:"Book created successfully",
    book
  })
  }catch(err){
    console.log(err.message);
    return res.status(500).json({
        success:false,
        message:"Internal server error"
    })
  }
};

export const getBooks = async (req,res) =>{
    try{
        const books = await Book.find();
        return res.status(200).json({
            success:true,
            books
        })
    }catch(err){
        console.log("Error in fetching books :",err.message)
        return res.status(500).json({
            success:false,
            message:"Internal Server error"
        })
    }
}

export const getBookById = async (req,res) =>{
    try{
        const {id} = req.params
        if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({
        success:false,
        message:"Invalid Book ID"
    });
}
        const book = await Book.findById(id);
        if(!book){
            return res.status(404).json({
                success:false,
                message:"Book Not Found"
            })
        }

        return res.status(200).json({
            success:true,
            book
        })

    }catch(err){
        console.log("Error in fetching book :",err.message)
        return res.status(500).json({
            success:false,
            message:"Internal Server error"
        })
    }
}
export const updateBook = async (req,res)=>{
    try{

    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
    return res.status(400).json({
        success:false,
        message:"Invalid Book ID"
    });
}
    const newBook = await Book.findByIdAndUpdate(id,req.body,{ returnDocument: 'after', runValidators: true })
    if(!newBook){
        return res.status(404).json({
            success:false,
            message:"Book not found"
        })
    }
    return res.status(200).json({
        success:true,
        message:"Book Updated Successfully",
        book:newBook
    })
}
catch(err){
    console.log("Error Update book",err.message);
    return res.status(500).json({
        success:false,
        message:"Internal Server error"
        })
}
}
export const deleteBook = async (req,res)=>{
    try{
    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
    return res.status(400).json({
        success:false,
        message:"Invalid Book ID"
    });
}
    const deletedBook = await Book.findByIdAndDelete(id);
    if (!deletedBook) {
      return res.status(404).json({ 
        success: false,
        message: "Book not found. Nothing deleted."
     });
    }
    return res.status(200).json({
        success:true,
        message:"Book deleted successfully",
        book:deletedBook
    })
    }catch(err){
        console.log("Error Delete book",err.message);
    return res.status(500).json({
        success:false,
        message:"Internal Server error"
        })
    }
}
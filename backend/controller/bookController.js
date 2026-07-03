import mongoose from "mongoose";
import Book from "../models/Book.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

export const createBook = async (req, res) => {
  try{
    const {
    title,
    author,
    originalPrice,
    discountedPrice,
    description,
    category,
    stock,
  } = req.body;

  if (
    !title ||
    !author ||
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
   
  if(!req.file){
        return res.status(400).json({
            success:false,
            message:"Book image is required "
        })
  }

  const uploadImage  = await uploadOnCloudinary(req.file.path);
  if(!uploadImage){
     return res.status(500).json({
        success:false,
        message:"Image upload failed"
     })
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
    image :{
        url : uploadImage.secure_url,
        publicId:uploadImage.public_id
    },
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

        const page = Math.max(Number(req.query.page) || 1 ,1) ;
        const limit = Math.max(Number(req.query.limit) || 10,1);
        const skip = (page - 1)*limit;

        let query = {};
        if(req.query.search){
          const search = req.query.search;
          query.$or = [
    
                  {title:{$regex:search,$options:"i"}},
                  {author:{$regex:search,$options:"i"}},
                  {category:{$regex:search,$options:"i"}}
                
              ]
        }
        if(req.query.category) query.category = req.query.category;
        
        let sort = {};
        if(req.query.sort=="price_asc"){
          sort.discountedPrice = 1;
        }
        else if(req.query.sort=="price_desc"){
          sort.discountedPrice = -1;
        }
        else if(req.query.sort=="newest"){
          sort.createdAt = -1;
        }
        const books = await Book.find(query).sort(sort).skip(skip).limit(limit);
        const totalBooks = await Book.countDocuments(query);
        const totalPages =  Math.ceil(totalBooks/limit);
        return res.status(200).json({
          success:true,
          currentPage:page,
          books,
          totalBooks,
          totalPages,
          hasNextPage:totalPages>page,
          hasPreviousPage:page>1
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

    if(req.file){
        const bookSearch = await Book.findById(id);
        if(!bookSearch){
        return res.status(404).json({
        success:false,
        message:"Book not found"
    });
    }
        if(bookSearch.image?.publicId) await deleteFromCloudinary(bookSearch.image.publicId)
        const cloudinaryUpload = await uploadOnCloudinary(req.file.path)
        req.body.image = {
            url : cloudinaryUpload.secure_url,
            publicId:cloudinaryUpload.public_id
        } 
    }
    const newBook = await Book.findByIdAndUpdate(id,req.body,{
        returnDocument: "after",
        runValidators: true
    })
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


export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Book ID"
      });
    }

    const deletedBook = await Book.findByIdAndDelete(id);
    
    if (!deletedBook) {
      return res.status(404).json({ 
        success: false,
        message: "Book not found."
      });
    }
    if (deletedBook.image?.publicId) {
      try {
        await deleteFromCloudinary(deletedBook.image.publicId);
      } catch (cloudinaryErr) {
        console.error("Failed to Delete from cloudinary", cloudinaryErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully",
      book: deletedBook
    });

  } catch (err) {
    console.error("Error Delete book:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server error"
    });
  }
};


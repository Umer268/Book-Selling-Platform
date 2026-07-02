import cloudinary from "../config/cloudinary.js";
import fs from "fs"

export const uploadOnCloudinary = async (filePath)=>{
    try{
        if(!filePath) return null;

        const response = await cloudinary.uploader.upload(
            filePath,
            {
                resource_type : "image",
                folder:"books"
            }
        )
        await fs.promises.unlink(filePath);
        console.log("File uploaded successfully to cloudinary");
        return response;

    }catch(err){
        if(filePath) await fs.promises.unlink(filePath).catch(()=>{});
        return null;
    }

}

export const deleteFromCloudinary = async (publicId) =>{
    try{

        if(!publicId) return null;

        return await cloudinary.uploader.destroy(publicId)


    }catch(err){
        console.log("Error while deleting image from cloudinary : ",
        err.message);
        return null;
    }
}
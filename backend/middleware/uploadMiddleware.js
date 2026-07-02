import multer from "multer"

const storage = multer.diskStorage({
    destination: "./public/temp",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

export const upload = multer({
    storage,
    limits : {
        fileSize : 5*1024*1024
    },
    fileFilter:(req,file,cb)=>{
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ]

        if(allowedTypes.includes(file.mimetype)){
            cb(null,true);
        }
        else{
            cb(
                new Error(
                "Only JPG, PNG and WEBP images are allowed."
                ),
                false
            );
        }
    }

})
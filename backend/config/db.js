import mongoose from "mongoose";

const connectDB = async ()=>{
    try{
       const connect = await mongoose.connect(process.env.MONGO_URL);
       console.log(`MongoDB connected succesfully : ${connect.connection.host}`)
    }
    catch(err){
         console.log(`Error in DB : ${err.message}`)
         process.exit(1);
    }
}
export default connectDB;
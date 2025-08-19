import mongoose from "mongoose";

const connectDb = async ()=>{
    try {
       const connectionInstance = await mongoose.connect(`${process.env.MONGO_DB_URI}`)
       if(connectionInstance)
        console.log("connected to DB")
    } catch (error) {
       console.log("error connecting to mongoDb via mongoose",error) 
    }
}

export {connectDb}
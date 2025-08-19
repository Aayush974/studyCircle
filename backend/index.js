import 'dotenv/config'
import app from './app.js'
import { connectDb } from './db/connectDb.js'

connectDb().then(()=>{
     app.listen(process.env.PORT,()=>{
        console.log("app started listening to port:",process.env.PORT)
     })
}).catch((err)=>{
    console.log("toruble connecting to mongoDb error: ",err)
})
import e, { urlencoded } from "express";
import cookieParser from "cookie-parser"
import { userRouter } from "./routes/user.routes.js";

const app = e()
app.use(urlencoded())
app.use(cookieParser())
app.use("/api/v1/users",userRouter)

export default app
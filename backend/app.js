import e, { urlencoded } from "express";
import cookieParser from "cookie-parser"
import { userRouter } from "./routes/user.routes.js";
import workspaceRouter from "./routes/workspace.routes.js";

const app = e()
app.use(urlencoded())
app.use(cookieParser())
app.use("/api/v1/users",userRouter)
app.use("/api/v1/workspace",workspaceRouter)

export default app
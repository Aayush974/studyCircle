import e from "express";
import { userRouter } from "./routes/user.routes.js";

const app = e()

app.use("/api/v1/users",userRouter)

export default app
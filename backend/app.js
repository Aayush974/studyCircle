import cors from "cors";
import e, { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import { userRouter } from "./routes/user.routes.js";
import workspaceRouter from "./routes/workspace.routes.js";
import messageRouter from "./routes/message.route.js";
import roomRouter from "./routes/room.routes.js";

const whiteList = [process.env.LOCAL_ENV_URL_CORS];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whiteList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

const app = e();
app.use(cors(corsOptions));
app.use(urlencoded());
app.use(cookieParser());
app.use(json());
app.use("/api/v1/users", userRouter);
app.use("/api/v1/workspace", workspaceRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/room", roomRouter);

export default app;

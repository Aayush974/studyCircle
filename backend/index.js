import "dotenv/config";
import app from "./app.js";
import { connectDb } from "./db/connectDb.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { userSocket } from "./socket/user.socket.js";
import verifySocket from "./middlewares/socketAuth.middleware.js";
import { messageSocket } from "./socket/message.socket.js";
import { roomSocket } from "./socket/room.socket.js";
const server = createServer(app); // creating a node.js http server using express app
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const whiteList = [process.env.LOCAL_ENV_URL_CORS];
      if (
        !origin ||
        whiteList.indexOf(origin) !== -1 ||
        origin.includes("vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  },
});
io.use(verifySocket); // auth middleware for socket connection

userSocket(io);
roomSocket(io);
messageSocket(io);

connectDb()
  .then(() => {
    // Important: use server.listen instead of app.listen
    // app.listen would internally create a *new* HTTP server instance, like app.createServer().listen
    // server.listen ensures Express routes and Socket.IO share the same server & port.
    server.listen(process.env.PORT, () => {
      console.log("server started on port:", process.env.PORT);
    });
  })
  .catch((err) => {
    console.log("toruble connecting to mongoDb error: ", err);
  });

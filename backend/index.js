import "dotenv/config";
import app from "./app.js";
import { connectDb } from "./db/connectDb.js";
import { createServer } from "node:http";
import { Server } from "socket.io";

const server = createServer(app); // creating a node.js http server using express app
const io = new Server(server); // creating a new socket.io server instance that share the same underlying HTTP server as express app

io.on("connection", async function (socket) {
  socket.on("joinWorkspace", (workspaceId) => {
    socket.join(workspaceId);
    console.log(`socket ${socket.id} joined room ${workspaceId}`);
  });

  socket.on("sendMsg", (data) => {
    console.log(
      `message received from ${socket.id}, broadcasting it to ${data.workspaceId}`
    );
    io.to(data.workspaceId).emit("receiveMsg", data.msg);
  });
});

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

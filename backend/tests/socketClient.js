// this is a test file meant to test the socket.io connections

import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  transports: ["websocket"], // this makes debugging easier as it ensures that no fallbacks are considered(http long polling) and connection takes place via websockets, be sure to remove it in outside of testing
});

socket.on("connect", () => {
  console.log("✅ Connected to server, id:", socket.id);
});

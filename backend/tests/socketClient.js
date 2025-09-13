// this is a test file meant to test the socket.io connections

import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:3000"; // local server
const USER_NO = 5; // the total no. of clients this script will make
const USERS = []; // the user socket instance and the  associated dummy workspaceId will be stored in here for each user in an object
const WORKSPACE_IDs = ["room 1", "room 27"]; // dummy workspace ids

// functionn to create clients
const createClient = (workspaceId) => {
  const socket = io(SERVER_URL, {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("✅ Connected to server, id:", socket.id);
    USERS.push({
      socket,
      workspaceId,
    });
    socket.emit("joinWorkspace", workspaceId);
  });

  socket.on("receiveMsg", (msg) => {
    console.log(`${msg} received by ${socket.id}`);
  });
  return socket;
};

// loop to create a new client, assign it a workspace and then push data to the USERS array
for (let i = 0; i < USER_NO; i++) {
  let socket;
  if (i % 2 == 0) {
    socket = createClient(WORKSPACE_IDs[0]);
  } else {
    socket = createClient(WORKSPACE_IDs[1]);
  }
}

console.log("users list", USERS);

setTimeout(() => {
  USERS[0].socket.emit("sendMsg", {
    msg: `hello i am ${USERS[0].socket.id} currently sending a message in ${USERS[0].workspaceId}`,
    workspaceId: USERS[0].workspaceId,
  });
}, 1000);

setTimeout(() => {
  USERS[1].socket.emit("sendMsg", {
    msg: `hello i am ${USERS[1].socket.id} currently sending a message in ${USERS[1].workspaceId}`,
    workspaceId: USERS[1].workspaceId,
  });
}, 2000);

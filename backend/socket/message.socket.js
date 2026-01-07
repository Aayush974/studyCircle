import eventBus from "../utils/eventBus.js";
import {
  getPendingAckMap,
  setPendingAck,
  clearPendingMsg,
  scheduleRetry,
} from "./trackAck.js";
import { getRoomMap } from "./room.socket.js";

const pendingAckMap = getPendingAckMap();
const roomMap = getRoomMap();

export const messageSocket = function (io) {
  eventBus.on("chat:create-msg", ({ message, user }) => {
    if (!message.targetId) return;

    const room = roomMap.get(message.targetId);

    // 1. setting the pending ACKs for all users in the room
    for (const userId of room.keys()) {
      setPendingAck({
        userId,
        messageId: message._id.toString(),
        roomId: message.targetId,
      });
    }
    console.log("[SEND]", user._id, message._id);
    console.log("map", pendingAckMap.size);
    io.to(message.targetId).emit("chat:send-msg", {
      message,
      user,
      retry: false,
    }); // 2. emitting msg to all the users in the room
    scheduleRetry({ io, user, message }); // 3. scheduling a retry timer
  });

  io.on("connection", (socket) => {
    socket.on("chat:ack-msg", (response) => {
      // 4. ack arrives from user , if not then the retry timer will fire
      clearPendingMsg(response.userId, response.msgId);
      console.log("[ACK]", response.userId, response.msgId);
      console.log("map", pendingAckMap);
    });
  });
};

import eventBus from "../utils/eventBus.js";
import {
  getPendingAckMap,
  setPendingAck,
  clearPendingMsg,
  scheduleRetry,
} from "./trackAck.js";
import { getRoomMap } from "./room.socket.js";
import { Message } from "../models/message.model.js";

const pendingAckMap = getPendingAckMap();
const roomMap = getRoomMap();

export const messageSocket = function (io) {
  eventBus.on("chat:create-msg", ({ message, user }) => {
    if (!message.targetId) return;

    const room = roomMap.get(message.targetId);

    // 1. setting the pending ACKs and scheduling message retries for all users in the room
    for (const userId of room?.keys()) {
      setPendingAck({
        userId,
        messageId: message._id.toString(),
        roomId: message.targetId,
      });
      scheduleRetry({io,userId,message,sender:user})
    }
    io.to(message.targetId).emit("chat:send-msg", {
      message,
      user,
      retry: false,
    }); // 2. emitting msg to all the users in the room
  });

  io.on("connection", (socket) => {
    socket.on("chat:ack-msg", (response) => {
      // 3. ack arrives from user , if not then the retry timer will fire
      clearPendingMsg(response.userId, response.msgId);
    });

    socket.on("chat:sync-req", async ({ roomId, lastSeenMsg }) => {
      try {
        if (!roomId || !lastSeenMsg) return;
        const lastCreatedAt = lastSeenMsg.createdAt;
        const lastId = lastSeenMsg._id;
        const messages = await Message.find({
          targetId: roomId,
          targetType: "room",
          $or: [
            { createdAt: { $gt: lastCreatedAt } },
            {
              createdAt: lastCreatedAt,
              _id: { $gt: lastId },
            },
          ],
        }).sort({ createdAt: 1, _id: 1 });
        socket.emit("chat:sync-res", { messages });
      } catch (error) {
        console.log(error);
      }
    });
  });
};

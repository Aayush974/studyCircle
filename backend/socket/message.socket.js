import eventBus from "../utils/eventBus.js";

export const messageSocket = function (io) {
  eventBus.on("chat:create-msg", ({ message, user }) => {
    if (!message.targetId) return;
    io.to(message.targetId).emit("chat:send-msg", { message, user });
  });
};

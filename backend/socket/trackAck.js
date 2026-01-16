const RETRY_INTERVAL = 3000; // 3s
const MAX_RETRIES = 3; // ~9s total
const CLEAR_AFTER = 20000; // TTL of acknowledgment

const pendingAckMap = new Map(); // {userid:{}}

export const getPendingAckMap = () => {
  return pendingAckMap;
};

// function to add a user to the map if it doesn't already exist
export const ensureUser = (userId) => {
  if (!pendingAckMap.has(userId)) {
    pendingAckMap.set(userId, new Map());
  }
};

export const setPendingAck = ({ userId, messageId, roomId }) => {
  if (!userId || !messageId || !roomId) return;
  ensureUser(userId);
  pendingAckMap.get(userId).set(messageId, {
    room: roomId,
    sentAt: Date.now(),
    retryAttempts: 0,
    retryTimer: null,
    clearTimer: setTimeout(() => {
      pendingAckMap.get(userId).delete(messageId);
      if (pendingAckMap.get(userId).size === 0) {
        pendingAckMap.delete(userId);
      }
    }, CLEAR_AFTER),
  });
};

export const scheduleRetry = ({ io, userId, message,sender }) => {
  if (!io || !userId || !message._id) return;

  const messageId = message._id.toString();

  const userMap = pendingAckMap.get(userId);
  if (!userMap) return;

  const entry = userMap.get(messageId);
  if (!entry) return;

  // setting the retry function for the message
  entry.retryTimer = setTimeout(() => {
    // if ack arrived by a delay from client or due to effect of some prev retryTimer
    if (!pendingAckMap.has(userId)) return;
    if (!pendingAckMap.get(userId).has(messageId)) return;

    if (entry.retryAttempts >= MAX_RETRIES) {
      // Give up
      return;
    }
    entry.retryAttempts++; // increment the retry attempt
    io.to(userId).emit("chat:send-msg", { message, user:sender, retry: true }); // emit to the specific user
    scheduleRetry({ io, userId, message,sender }); // calling schedule retry for the same message
  }, RETRY_INTERVAL);
};

// clearing a single pending message of a user
export const clearPendingMsg = (userId, MsgId) => {
  const userAckMap = pendingAckMap.get(userId);
  if (!userAckMap) return;

  const entry = userAckMap.get(MsgId);
  if (!entry) return;
  clearTimeout(entry.clearTimer);
  clearTimeout(entry.retryTimer);
  userAckMap.delete(MsgId);

  if (userAckMap.size === 0) {
    pendingAckMap.delete(userId);
  }
};

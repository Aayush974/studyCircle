export const getSyncedChat = (prevMsgs = [], newMsgs = []) => {
  const map = new Map();

  // Insert previous messages first
  for (const msg of prevMsgs) {
    map.set(msg._id, msg);
  }

  // New messages overwrite old ones if same _id appears
  for (const msg of newMsgs) {
    map.set(msg._id, msg);
  }

  const msgs = Array.from(map.values()).sort((a, b) => {
    const t1 = new Date(a.createdAt).getTime();
    const t2 = new Date(b.createdAt).getTime();

    if (t1 !== t2) return t1 - t2;
    return a._id.localeCompare(b._id);
  });
  return msgs;
};

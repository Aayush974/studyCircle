// using map to keep track of active room and its users
const roomMap = new Map();

const handleLeave = (socket, reason = "disconnect") => {
  const { userDetails, roomId } = socket;

  if (!roomId || !userDetails._id) return;
  const rm = roomMap.get(roomId);
  if (!rm) return;

  const entry = rm.get(userDetails._id);
  if (!entry) return;

  entry.sockets.delete(socket.id); // delete the socket which disconnected from the set of active sockets

  if (entry.sockets.size === 0) {
    // update the entries presence to false i.e the user has exited the workspace
    rm.delete(userDetails._id);
    socket.leave(roomId);
    // if no users are present in the workspace delete it from the modal
    if (rm.size === 0) {
      roomMap.delete(roomId);
    }
  }
};

export const roomSocket = function (io) {
  io.on("connection", async function (socket) {
    socket.on("enterRoom", ({ roomId, user }) => {
      socket.roomId = roomId; // attach workspace id to the server socket instance for disconnect handling purpose
      socket.userDetails = user; // since a user object is already attached during the socketAuth middleware
      // if a workspace is entered for the first time add it to the map model
      if (!roomMap.has(roomId)) {
        roomMap.set(roomId, new Map());
      }
      const rm = roomMap.get(roomId);
      let userEntry = rm.get(user._id); // each user entry is indexed by the user id

      if (!userEntry) {
        rm.set(user._id, {
          user,
          sockets: new Set(), // each user entry has a sockets Set object which will keep track of the active sockets of that user, active socket for user increments incase of refresh or multiple tabs opened by the same user
          leaveTimer: null, // a timed function to delay the disconnect
        });
        userEntry = rm.get(user._id);
      }

      userEntry.sockets.add(socket.id); // adding the no. of active sockets to the users entry whenver the user joins

      socket.join(roomId); // joining socket room
    });

    socket.on("disconnect", () => {
      handleLeave(socket, "disconnect");
    });

    socket.on("leaveRoom", () => {
      handleLeave(socket, "leave");
    });
  });
};

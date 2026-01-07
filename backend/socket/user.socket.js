// using map to keep track of active workspace and its users
const workspaceMap = new Map();
// reconnection time window of 3s
const reconnectionTime = 3000;

function handleLeave(io, socket, reason = "unknown") {
  const { userDetails, workspaceId } = socket;

  if (!workspaceId || !userDetails?._id) return;

  const ws = workspaceMap.get(workspaceId);
  if (!ws) return;

  const entry = ws.get(userDetails._id);
  if (!entry) return;

  // Remove this socket
  entry.sockets.delete(socket.id);

  // If user still has active sockets, they are still present
  if (entry.sockets.size > 0) return;

  // Avoid scheduling multiple leave timers
  if (entry.leaveTimer) return;

  entry.leaveTimer = setTimeout(() => {
    // User reconnected meanwhile
    if (entry.sockets.size > 0) {
      entry.leaveTimer = null;
      return;
    }

    entry.isPresent = false;
    ws.delete(userDetails._id);
    socket.leave(workspaceId);

    io.to(workspaceId).emit("notification", {
      type: "leave",
      user: entry.user,
      reason,
      message: `${entry.user.username} exited the workspace`,
    });

    // Cleanup empty workspace
    if (ws.size === 0) {
      workspaceMap.delete(workspaceId);
    }
  }, reconnectionTime);
}

export const userSocket = function (io) {
  io.on("connection", async function (socket) {
    socket.join(socket.user._id.toString()); // join a socket to a individual userId room this is to be able to broadcast private events to a single socket like msg retries
    socket.on("enterWs", ({ workspaceId, user }) => {
      socket.workspaceId = workspaceId; // attach workspace id to the server socket instance for disconnect handling purpose
      socket.userDetails = user; // since a user object is already attached during the socketAuth middleware
      // if a workspace is entered for the first time add it to the map model
      if (!workspaceMap.has(workspaceId)) {
        workspaceMap.set(workspaceId, new Map());
      }
      const ws = workspaceMap.get(workspaceId);
      let userEntry = ws.get(user._id); // each user entry is indexed by the user id

      if (!userEntry) {
        ws.set(user._id, {
          user,
          sockets: new Set(), // each user entry has a sockets Set object which will keep track of the active sockets of that user, active socket for user increments incase of refresh or multiple tabs opened by the same user
          leaveTimer: null, // a timed function to delay the disconnect
          isPresent: false, // tacks user presence , the user has  no presence if it has left the workspace for more than the reconnectionTIme, initially its set to false
        });
        userEntry = ws.get(user._id);
      }

      userEntry.sockets.add(socket.id); // adding the no. of active sockets to the users entry whenver the user joins

      socket.join(workspaceId); // joining socket room

      if (userEntry.leaveTimer) {
        // if a leaveTime function is present clear that function out since a connection attempt has been made
        clearTimeout(userEntry.leaveTimer);
        userEntry.leaveTimer = null;
      }

      if (!userEntry.isPresent) {
        // if user has no presence
        userEntry.isPresent = true;
        io.to(workspaceId).emit("notification", {
          type: "enter",
          user,
          message: `${user.username} entered the workspace`,
        });
      }
    });

    socket.on("leaveWs", () => {
      handleLeave(io, socket, "leave");
    });

    socket.on("disconnect", () => {
      handleLeave(io, socket, "disconnect");
    });
  });
};

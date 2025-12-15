// using map to keep track of active workspace and its users
const workspaceMap = new Map();
// reconnection time window of 3s
const reconnectionTime = 3000;

export const userSocket = function (io) {
  io.on("connection", async function (socket) {
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

    socket.on("disconnect", () => {
      const { userDetails, workspaceId } = socket;

      if (!workspaceId || !userDetails._id) return;
      const ws = workspaceMap.get(workspaceId);
      if (!ws) return;

      const entry = ws.get(userDetails._id);
      if (!entry) return;

      entry.sockets.delete(socket.id); // delete the socket which disconnected from the set of active sockets

      if (entry.sockets.size === 0) {
        // if socket count has reached 0 then it has no active sockets left so schedule cleanup
        // in the ws model add the leave time fxn

        entry.leaveTimer = setTimeout(() => {
          // if reconnection has been made then return
          if (entry.sockets.size > 0) return;

          // update the entries presence to false i.e the user has exited the workspace
          entry.isPresent = false;
          ws.delete(userDetails._id);

          io.to(workspaceId).emit("notification", {
            type: "leave",
            user: entry.user,
            message: `${entry.user.username} exited the workspace`,
          });

          // if no users are present in the workspace delete it from the modal
          if (ws.size === 0) {
            workspaceMap.delete(workspaceId);
          }
        }, reconnectionTime);
      }
    });
  });
};

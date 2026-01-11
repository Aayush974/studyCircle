import useSocket from "../zustand/socket.store";
import useWorkspace from "../zustand/useWorkspace";

let currentWorkspace = null;
let currentRoom = null;
const { setToInitial, setSelectedRoom } = useWorkspace.getState();

export function connectSocket(user) {
  if (!user) return;

  const { socket, setSocket } = useSocket.getState();
  if (socket) return; // already connected

  setSocket(user);
}

export function enterWorkspace(workspaceId, user) {
  if (!workspaceId || !user) return;

  const { socket } = useSocket.getState();
  if (!socket) return;

  if (currentWorkspace === workspaceId) return;

  if (currentWorkspace) {
    leaveWorkspace(currentWorkspace, user);
  }

  currentWorkspace = workspaceId;
  socket.emit("enterWs", { workspaceId, user });
}

export function leaveWorkspace(workspaceId, user) {
  if (!workspaceId || !user) return;

  const { socket } = useSocket.getState();
  if (!socket) return;

  if (!(currentWorkspace === workspaceId)) return;

  socket.emit("leaveWs", { workspaceId: currentWorkspace, user });
  currentWorkspace = null;
  currentRoom = null;
}

export function sendAck(userId, msgId) {
  if (!userId || !msgId) return;
  const { socket } = useSocket.getState();
  if (!socket) return;
  socket.emit("chat:ack-msg", {
    userId,
    msgId,
  });
}

export function enterRoom(roomId, user) {
  if (!roomId || !user) return;

  const { socket } = useSocket.getState();
  if (!socket) return;

  //if (currentRoom === roomId) return;

  if (currentRoom) {
    leaveRoom(currentRoom, user);
  }

  currentRoom = roomId;
  socket.emit("enterRoom", { roomId, user });
}

export function leaveRoom(roomId, user) {
  if (!roomId || !user) return;

  const { socket } = useSocket.getState();
  if (!socket) return;

  if (!(currentRoom === roomId)) return;

  socket.emit("leaveRoom", { roomId: currentRoom, user });
  currentRoom = null;
}

export function disconnectSocket() {
  const { socket } = useSocket.getState();
  if (!socket) return;

  socket.disconnect();
  currentWorkspace = null;

  useSocket.setState({ socket: null });
}

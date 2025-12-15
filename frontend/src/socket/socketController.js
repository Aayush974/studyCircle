import useSocket from "../zustand/socket.store";

let currentWorkspace = null;

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
    socket.emit("leaveWs", { workspaceId: currentWorkspace });
  }

  currentWorkspace = workspaceId;
  socket.emit("enterWs", { workspaceId, user });
}

export function disconnectSocket() {
  const { socket } = useSocket.getState();
  if (!socket) return;

  socket.disconnect();
  currentWorkspace = null;

  useSocket.setState({ socket: null });
}

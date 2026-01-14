import { create } from "zustand";
import io from "socket.io-client";
import { enterRoom } from "../socket/socketController";
import useUser from "./user.store";

const useSocket = create((set) => ({
  socket: null,
  isReconnecting: false,
  isConnected: false,
  setSocket: async (user) => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    if (!user) return;
    try {
      const socketInstance = io(socketUrl, {
        auth: {
          user,
        },
        withCredentials: true,
        ackTimeout: 5000,
        reconnection: true,
        reconnectionAttempts: 3,
        timeout: 10000,
      });

      socketInstance.on("connect", () => {
        set({ isConnected: true, isReconnecting: false });
      });

      socketInstance.on("disconnect", () => {
        set({ isConnected: false,isReconnecting:true });
      });

      socketInstance.io.on("reconnection_attempt", () => {
        console.log("attempting reconnect")
        set({ isReconnecting: true });
      });

      socketInstance.io.on("reconnect", () => {
        const room = JSON.parse(sessionStorage.getItem("selectedRoom"));
        const roomId = room._id;
        const lastSeenMsg = JSON.parse(sessionStorage.getItem("lastSeenMsg"));
        const { user } = useUser.getState();
        if (!roomId || !lastSeenMsg || !room || !user) return;
        enterRoom(roomId, user);
        socketInstance.emit("chat:sync-req", {
          roomId,
          lastSeenMsg,
        });
        set({
          isConnected:true,
          isReconnecting: false,
        });
      });

      socketInstance.io.on("reconnect_failed", () => {
        set({
          isReconnecting: false,
        });
      });

      set({ socket: socketInstance });
    } catch (error) {
      console.log(error.message);
      set({ socket: null });
    }
  },
  reconnect: () =>
    set((state) => {
      state.socket?.connect();
      return state;
    }),
}));

export default useSocket;

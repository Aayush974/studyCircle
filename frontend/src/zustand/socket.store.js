import { create } from "zustand";
import io from "socket.io-client";

const useSocket = create((set) => ({
  socket: null,
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
        reconnectionDelay: 4000,
        timeout: 10000,
      });

      socketInstance.on("connect", () => {
        set({ isConnected: true });
      });

      socketInstance.on("disconnect", () => {
        set({ isConnected: false });
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

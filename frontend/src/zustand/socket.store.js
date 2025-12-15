import { create } from "zustand";
import io from "socket.io-client";

const useSocket = create((set) => ({
  socket: null,
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
        reconnectionAttempts: 3,
        timeout: 10000,
      });
      socketInstance.on("connect_error", (err) => {
        console.error("Socket connection failed:", err.message);
        socketInstance.disconnect();
        set({ socket: null });
      });
      set({ socket: socketInstance });
    } catch (error) {
      console.log(error.message);
      set({ socket: null });
    }
  },
}));

export default useSocket;

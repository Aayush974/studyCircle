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
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 4,
        timeout: 10000,
      });
      // socketInstance.on("connect_error", (err) => { 
      //   console.error("Socket connection failed:", err.message);
      //   socketInstance.disconnect(); // this breaks reconnection attempt
      //   set({ socket: null });
      // });
      socketInstance.on("disconnect", (reason) => {
        console.log("DISCONNECTED:", reason);
      });
      set({ socket: socketInstance });
    } catch (error) {
      console.log(error.message);
      set({ socket: null });
    }
  },
}));

export default useSocket;

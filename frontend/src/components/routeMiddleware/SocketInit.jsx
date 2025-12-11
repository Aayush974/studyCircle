import { useEffect } from "react";
import useSocket from "../../zustand/socket.store";

const SocketInit = ({ user }) => {
  const { socket, setSocket } = useSocket();

  useEffect(() => {
    if (user && !socket) {
      setSocket(user);
    }
  }, [user, socket, setSocket]);

  return null;
};

export default SocketInit;

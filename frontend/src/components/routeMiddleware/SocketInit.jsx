import { useEffect } from "react";
import { connectSocket } from "../../socket/socketController.js";

const SocketInit = ({ user }) => {
  useEffect(() => {
    if (!user) return;

    connectSocket(user);
  }, [user]);

  return null;
};

export default SocketInit;

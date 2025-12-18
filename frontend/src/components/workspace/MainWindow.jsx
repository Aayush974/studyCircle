import { useEffect } from "react";
import useWorkspace from "../../zustand/useWorkspace";
import WsGeneral from "./WsGeneral";
import Room from "./Room";
import useUser from "../../zustand/user.store";
const MainWindow = () => {
  const selectedRoom = useWorkspace((state) => state.selectedRoom);
  const setSelectedRoom = useWorkspace((state) => state.setSelectedRoom);
  const user = useUser((state) => state.user);
  useEffect(() => {
    const prevRoom = JSON.parse(sessionStorage.getItem("selectedRoom"));
    if (!prevRoom) return;
    setSelectedRoom(prevRoom);
  }, []);

  if (selectedRoom)
    return <Room room={selectedRoom} currentUserId={user._id} />;
  return <WsGeneral />;
};

export default MainWindow;

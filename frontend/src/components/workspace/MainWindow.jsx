import { useEffect } from "react";
import useWorkspace from "../../zustand/useWorkspace";
import WsGeneral from "./WsGeneral";
import Room from "./Room";

const MainWindow = () => {
  const selectedRoom = useWorkspace((state) => state.selectedRoom);
  const setSelectedRoom = useWorkspace((state) => state.setSelectedRoom);
  useEffect(() => {
    const prevRoom = JSON.parse(sessionStorage.getItem("selectedRoom"));
    if (!prevRoom) return;
    setSelectedRoom(prevRoom);
  }, []);

  if (selectedRoom) return <Room room={selectedRoom} />;
  return <WsGeneral />;
};

export default MainWindow;

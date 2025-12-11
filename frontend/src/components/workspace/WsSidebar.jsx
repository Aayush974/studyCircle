import { useEffect } from "react";
import { fetchWorkspace } from "../../api/workspace.api";
import { useParams } from "react-router-dom";
import useSocket from "../../zustand/socket.store";
import useWorkspace from "../../zustand/useWorkspace";

const WsSidebar = () => {
  const { workspaceId } = useParams();
  const { socket } = useSocket();
  const workspace = useWorkspace((state) => state.workspaceByIds[workspaceId]);
  return <>{workspace ? workspace.name : "Loading..."}</>;
};

export default WsSidebar;

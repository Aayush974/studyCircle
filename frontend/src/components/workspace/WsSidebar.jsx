import { useEffect } from "react";
import { fetchWorkspace } from "../../api/workspace.api";
import { useParams } from "react-router-dom";

const WsSidebar = () => {
  const { workspaceId } = useParams();
  useEffect(() => {
    (async () => {
      await fetchWorkspace(workspaceId);
    })();
  }, [fetchWorkspace]);
  return <>hi</>;
};

export default WsSidebar;

import { useEffect, useState } from "react";
import FlexContainer from "../common/FlexContainer.jsx";
import { getUserWorkspaces } from "../../api/workspace.api.js";
import useUser from "../../zustand/user.store.js";
import { ShowToast } from "../../utils/ShowToast.jsx";

const UserWorkspaces = function () {
  const [workspaces, setWorkspaces] = useState([]);
  const { user } = useUser();
  const userId = user?._id;
  useEffect(() => {
    (async () => {
      if (!userId) return;
      const res = await getUserWorkspaces(userId);
      if (res.status > 400 && res.error) {
        ShowToast(res.error?.message, {
          type: "error",
        });
        return;
      }
      setWorkspaces(res.data.workspaces || []);
    })();
  }, [userId]);

  return (
    <FlexContainer className="justify-start gap-4 flex-wrap">
      {workspaces.map((ws) => {
        const id = ws._id;
        return (
          <div
            key={id}
            className="bg-white dark:bg-gray-800 shadow-sm rounded-md p-3 w-64"
          >
            {ws.logo ? (
              <img
                src={ws.logo}
                alt={ws.name || "workspace"}
                className="h-32 w-full object-cover rounded"
              />
            ) : (
              <div className="h-32 w-full bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400">
                No image
              </div>
            )}

            <h3 className="font-semibold mt-2 text-sm truncate">
              {ws.name || "Untitled"}
            </h3>
          </div>
        );
      })}
    </FlexContainer>
  );
};

export default UserWorkspaces;

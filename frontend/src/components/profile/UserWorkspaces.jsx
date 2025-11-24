import { useEffect, useState } from "react";
import FlexContainer from "../common/FlexContainer.jsx";
import { getUserWorkspaces } from "../../api/workspace.api.js";
import useUser from "../../zustand/user.store.js";
import { ShowToast } from "../../utils/ShowToast.jsx";
import { IoAddCircleOutline } from "react-icons/io5";

const UserWorkspaces = function () {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const userId = user?._id;

  useEffect(() => {
    // call api using async iife
    (async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await getUserWorkspaces(userId);
        if (res.status > 400 && res.error) {
          ShowToast(res.error, {
            type: "error",
          });
          setWorkspaces([]);
          return;
        }
        setWorkspaces(res.data.workspaces || []);
      } catch (err) {
        ShowToast(err?.message || err || "Failed to fetch workspaces", {
          type: "error",
        });
        setWorkspaces([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  return (
    <main className="p-4">
      <div>
        <h2 className="text-xl md:text-2xl lg:text4xl xl:text-5xl  font-semibold my-8">
          Workspaces
        </h2>
        {/* if loading */}
        {loading || !workspaces ? (
          <div className=" text-gray-500 text-center text-lg md:text-xl lg:text:2xl xl:text-2xl">
            Loading...
          </div>
        ) : // if no workspaces found
        workspaces.length == 0 ? (
          <div className=" text-gray-500 text-center text-lg md:text-xl lg:text:2xl xl:text-2xl">
            No workspaces found!
          </div>
        ) : (
          // workspaces
          <FlexContainer className="justify-start gap-4 flex-wrap">
            {workspaces.map((ws) => {
              const id = ws._id;
              return (
                <div className="card bg-base-100 w-96 h-65 shadow-sm shadow-gray-300 hover:shadow-md hover:shadow-gray-500 rounded-md transition-shadow  ">
                  <figure className="w-full h-8/10">
                    {ws.logo ? (
                      <img
                        src={ws.logo}
                        alt={ws.name || "workspace"}
                        className="h-full w-full object-cover rounded-t shadow-md shadow-gray-400"
                      />
                    ) : (
                      <div className="h-32 w-full bg-gray-100  rounded flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title text-lg md:text-xl lg:text:2xl xl:text-2xl">
                      {ws.name}
                    </h2>
                  </div>
                </div>
              );
            })}
            {/* add more workspace icon */}
            <div className="ml-8 rounded-full bg-base-100 w-40 h-40 hover:shadow-2xl hover:shadow-grey-800 transition-all  ">
              <IoAddCircleOutline className=" w-full h-full text-gray-400 opacity-70 hover:text-gray-300 hover:opacity-100" />
            </div>
          </FlexContainer>
        )}
      </div>
    </main>
  );
};

export default UserWorkspaces;

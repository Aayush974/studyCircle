import { useEffect } from "react";
import { WsSidebar } from "../components";
import useSocket from "../zustand/socket.store";
import useUser from "../zustand/user.store";
import useWorkspace from "../zustand/useWorkspace";
import { useParams } from "react-router-dom";
import { fetchWorkspace } from "../api/workspace.api";

const Workspace = () => {
  const { socket, setSocket } = useSocket();
  const { user } = useUser();
  const { workspaceByIds, setworkspaceByIds } = useWorkspace();
  const { workspaceId } = useParams();

  // a reconnect option is given incase the socket connection fails due to some technical issues on the SocketInit component
  const reConnect = () => {
    if (!user) return;
    setSocket(user);
  };

  useEffect(() => {
    if (!(workspaceId in workspaceByIds)) {
      (async () => {
        const res = await fetchWorkspace(workspaceId);
        setworkspaceByIds(res.data?.workspace);
      })();
    }
  }, [workspaceId, workspaceByIds, setworkspaceByIds]);

  // this is causing unecessary ui changes so commenting it out for now will figure something later
  // if (!socket) {
  //   return (
  //     <div className="w-screen h-screen flex justify-center items-center">
  //       <main className="flex flex-col gap-8 items-center justify-center">
  //         <p className=" text-2xl md:text-3xl lg:text-4xl  xl:text-5xl ">
  //           {" "}
  //           Had trouble establishing connection
  //         </p>
  //         <button
  //           onClick={reConnect}
  //           className="btn btn-primary p-8 text-center text-2xl md:text-3xl lg:text-4xl "
  //         >
  //           Try again
  //         </button>
  //       </main>
  //     </div>
  //   );
  // }

  return (
    <>
      <WsSidebar />
    </>
  );
};

export default Workspace;

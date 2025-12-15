import { useEffect } from "react";
import { WsSidebar, WsGeneral } from "../components";
import useUser from "../zustand/user.store";
import useWorkspace from "../zustand/useWorkspace";
import { useParams } from "react-router-dom";
import { fetchWorkspace } from "../api/workspace.api";
import { enterWorkspace } from "../socket/socketController";

const Workspace = () => {
  const { user } = useUser();
  const { workspaceByIds, setworkspaceByIds } = useWorkspace();
  const { workspaceId } = useParams();

  // a reconnect option is given incase the socket connection fails due to some technical issues on the SocketInit component
  // const reConnect = () => {
  //   if (!user) return;
  //   setSocket(user);
  // };

  useEffect(() => {
    if (!(workspaceId in workspaceByIds)) {
      (async () => {
        const res = await fetchWorkspace(workspaceId);
        setworkspaceByIds(res.data?.workspace);
      })();
    }
  }, [workspaceId, workspaceByIds, setworkspaceByIds]);

  useEffect(() => {
    enterWorkspace(workspaceId, user);
  }, [workspaceId, user]);
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
    <div className="flex w-screen h-screen overflow-hidden">
      <div className="basis-3/10 h-full">
        <WsSidebar />
      </div>
      <main className="basis-7/10 h-full flex flex-col min-h-0">
        <WsGeneral />
      </main>
    </div>
  );
};

export default Workspace;

import { useRef } from "react";
import { IoAddCircleOutline } from "react-icons/io5";
import CreateWorkspaceModal from "./createWorkspace";
import JoinWorkspaceModal from "./JoinWorkspace";

const AddWsPopup = () => {
  const modalRef = useRef();
  const createWorkspaceRef = useRef();
  const joinWorkspaceRef = useRef();
  return (
    <>
      {/* dialog open button */}
      <button
        className="rounded-full self-center bg-base-100 w-8 h-8 xl:w-12 xl:h-12 cursor-pointer hover:shadow-2xl hover:shadow-grey-800 transition-all"
        onClick={() => modalRef.current?.showModal()}
      >
        <IoAddCircleOutline className=" w-full h-full text-gray-400 opacity-70 hover:text-gray-300 hover:opacity-100" />
      </button>
      {/* dialog content */}
      <dialog ref={modalRef} id="add_workspace_modal" className="modal">
        <div className="modal-box flex flex-col items-center justify-between w-4/10 min-w-90 max-w-5xl gap-4 relative">
          <h2 className="text-center mb-8 text-xl md:text-2xl lg:text4xl xl:text-5xl font-semibold">
            Add a new workspace
          </h2>
          <button
            onClick={() => {
              modalRef.current?.close();
              createWorkspaceRef.current?.showModal();
            }}
            className="btn w-1/2 p-4 rounded-sm text-lg md:text-xl lg:text-2xl"
          >
            Create workspace
          </button>
          <button
            onClick={() => {
              modalRef.current?.close();
              joinWorkspaceRef.current?.showModal();
            }}
            className="btn w-1/2 p-4 rounded-sm text-lg md:text-xl lg:text-2xl"
          >
            Join workspace
          </button>
          <CreateWorkspaceModal dialogRef={createWorkspaceRef} />
          <JoinWorkspaceModal dialogRef={joinWorkspaceRef} />
          <dialog></dialog>
          {/* dialog close */}
          <div className="absolute top-1 right-1 m-0 ">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost">✕</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default AddWsPopup;

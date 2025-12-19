import { useParams } from "react-router-dom";
import useWorkspace from "../../zustand/useWorkspace";
import { createRoom, getAllRooms } from "../../api/room.api";
import useUser from "../../zustand/user.store";
import { ShowToast } from "../../utils/ShowToast";
import { useEffect, useRef, useState } from "react";

const WsSidebar = () => {
  const { workspaceId } = useParams();
  const workspace = useWorkspace((state) => state.workspaceByIds[workspaceId]);
  const rooms = useWorkspace((state) => state.rooms);
  const setRooms = useWorkspace((state) => state.setRooms);
  const setSelectedRoom = useWorkspace((state) => state.setSelectedRoom);
  const { user } = useUser();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const modalRef = useRef();

  const addRoom = async (e) => {
    e.preventDefault();
    if (!user || !workspaceId || !name.trim()) return;

    const res = await createRoom({
      userId: user._id,
      workspaceId,
      name: name.trim(),
    });

    if (res.status >= 400 && res.error) {
      ShowToast(res.error?.message, { type: "error" });
      return;
    }

    ShowToast(res.data?.message, { type: "success" });
    setRooms(
      rooms ? [...rooms, res.data?.room] : [res.data?.room]
    );
    setName("");
    modalRef.current?.close();
  };

  useEffect(() => {
    if (!workspaceId) return;

    const fetchRooms = async () => {
      setLoading(true);
      const res = await getAllRooms(workspaceId);

      if (res.status >= 400 && res.error) {
        setRooms([]);
      } else {
        setRooms(res.data?.rooms || []);
      }

      setLoading(false);
    };

    fetchRooms();
  }, [workspaceId, workspace]);

  return (
    <aside className="h-screen max-h-screen border-r border-base-300 flex flex-col">
      {/* Workspace header */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-base-200 shadow-md">
        {workspace?.logo ? (
          <img
            src={workspace.logo}
            alt="workspace logo"
            className="w-10 h-10 rounded-md object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-md flex items-center justify-center">
            🏠
          </div>
        )}
        <h2
          onClick={() => {
            sessionStorage.setItem("selectedRoom", null);
            setSelectedRoom(null);
          }}
          className="text-xl md:text-3xl lg:text-3xl xl:text-5xl font-bold cursor-pointer"
        >
          {workspace ? workspace.name : "..."}
        </h2>
      </div>

      {/* Rooms header */}
      <div className="p-4 flex items-center justify-between mb-2">
        <span className="text-md md:text-lg lg:text-xl xl:text-2xl font-semibold text-base-content/70">
           Rooms
        </span>
        <button
          className="btn p-2 btn-primary text-md md:text-lg lg:text-xl xl:text-2xl font-semibold text-base-content/70"
          onClick={() => modalRef.current?.showModal()}
        >
          + New
        </button>
      </div>

      {/* Rooms list */}
      <ul className="p-4 flex-1 overflow-y-auto space-y-1">
        {loading && (
          <li className="text-sm text-base-content/60">Loading rooms…</li>
        )}

        {!loading && rooms.length === 0 && (
          <li className="text-sm text-base-content/60">No rooms yet</li>
        )}

        {!loading &&
          rooms.map((room) => (
            <li
              onClick={() => {
                setSelectedRoom(room);
              }}
              key={room._id}
              className="px-3 py-2 rounded-md hover:bg-base-200 cursor-pointer"
            >
              {room.name}
            </li>
          ))}
      </ul>

      {/* Create room modal */}
      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          <form onSubmit={addRoom}>
            <button
              type="button"
              onClick={() => modalRef.current?.close()}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>

            <h3 className="font-bold mb-4">Create Study Room</h3>

            <div className="flex gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Room name"
                className="input input-bordered flex-1"
              />
              <button type="submit" className="btn btn-primary">
                Create
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </aside>
  );
};

export default WsSidebar;

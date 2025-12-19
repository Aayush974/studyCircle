import { create } from "zustand";

const useWorkspace = create((set, get) => ({
  workspaceByIds: {
    // this struccture is used for potential caching features to be implemented later on down the line
    // wsId: {wsDetails}
  },
  rooms: [], // holds the list of study rooms of the current workspace
  setRooms: (rooms) => {
    if (!Array.isArray(rooms)) return;

    set((state) => {
      const prev = state.rooms;
      //
      if (
        prev.length === rooms.length &&
        prev.every((r, i) => r._id === rooms[i]?._id)
      ) {
        return state;
      }

      return { rooms: rooms };
    });
  },
  selectedRoom: null,
  setSelectedRoom: (room) => {
    set((state) => {
      if (!room) {
        return { selectedRoom: null };
      }
      if (state.selectedRoom && state.selectedRoom._id === room._id)
        return state; // same room selection
      sessionStorage.setItem("selectedRoom", JSON.stringify(room));
      return { selectedRoom: room };
    });
  },
  setworkspaceByIds: (data) => {
    if (!data) return;
    const exists = get().workspaceByIds[data._id]; // if ws data already exists in the store
    if (exists) return;
    set((state) => ({
      workspaceByIds: {
        ...state.workspaceByIds,
        [data._id]: data,
      },
    }));
  },
}));

export default useWorkspace;

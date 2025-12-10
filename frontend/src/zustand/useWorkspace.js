import { create } from "zustand";

const useWorkspace = create((set, get) => ({
  workspaceByIds: {
    // this struccture is used for potential caching features to be implemented later on down the line
    // wsId: {wsDetails}
  },
  setworkspaceByIds: (data) => {
    if (!data) return;
    const exists = get.workspaceByIds[data._id]; // if ws data already exists in the store
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

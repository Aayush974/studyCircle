import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const useUser = create(
  persist(
    (set) => ({
      user: null,
      setUser: (userData) => {
        set({ user: userData });
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);

export default useUser;

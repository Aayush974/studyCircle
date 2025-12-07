import { useState } from "react";
import { Input } from "../../index";
import { searchWorkspace, joinWorkspace } from "../../../api/workspace.api";
import { ShowToast } from "../../../utils/ShowToast";

const JoinWorkspaceModal = ({ dialogRef }) => {
  const [query, setQuery] = useState("");
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [password, setPassword] = useState(null);
  const [joinError, setJoinError] = useState(null);

  // query handling
  const handleSearch = async (e) => {
    e.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) {
      setErrorMsg("enter a workspace name to search");
      setWorkspaces([]);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await searchWorkspace(trimmed);

    if (res.error) {
      const msg =
        typeof res.error === "string"
          ? res.error
          : res.error?.message || "something went wrong";
      setErrorMsg(msg);
      setWorkspaces([]);
    } else {
      setWorkspaces(res.data?.workspaces || []);
    }

    setLoading(false);
  };

  // reset states on dialog close
  const resetState = () => {
    setQuery("");
    setWorkspaces([]);
    setErrorMsg(null);
    setLoading(false);
  };

  // joining a workspace
  const handleJoin = async (ws) => {
    if (ws.passwordRequired && !password) {
      setJoinError("password required to join");
      return;
    }
    const res = await joinWorkspace({
      workspaceId: ws._id,
      password: ws.passwordRequired ? password : null,
    });

    if (res.status > 400 && res.error) {
      // if error occurred
      ShowToast(res.error?.message, {
        type: "error",
      });
      return;
    }

    ShowToast(res.data?.message, {
      type: "success",
      onClose: () => {
        dialogRef.current.close();
      },
    });
  };

  return (
    <>
      <dialog
        ref={dialogRef}
        id="join_workspace_modal"
        className="modal"
        onClose={resetState}
      >
        <div className="modal-box flex flex-col items-center justify-between w-4/10 min-w-90 max-w-5xl gap-4 relative">
          <h2 className="text-center mb-4 text-xl md:text-2xl lg:text4xl xl:text-5xl font-semibold">
            Join Workspace
          </h2>

          {/* Section 1: Search bar */}
          <section className="w-full flex flex-col gap-2">
            <form
              onSubmit={handleSearch}
              className="w-full flex items-center gap-2"
            >
              <Input
                type="text"
                className="input"
                placeholder="search workspace by name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary whitespace-nowrap"
                disabled={loading} //so multiple queries can't be sent when loading
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Search"
                )}
              </button>
            </form>

            {errorMsg && <p className="text-error text-sm">{errorMsg}</p>}
          </section>

          {/* Section 2: Results */}
          <section className="w-full border-t pt-4 max-h-80 overflow-y-auto flex flex-col gap-2">
            {loading && (
              <div className="w-full flex justify-center py-4">
                <span className="loading loading-spinner" />
              </div>
            )}

            {!loading && workspaces.length === 0 && !errorMsg && (
              <p className="text-sm text-center text-base-content/70">
                no workspaces to show. try searching by name.
              </p>
            )}

            {!loading && workspaces.length > 0 && (
              <ul className="flex flex-col gap-2">
                {workspaces.map((ws) => (
                  <li
                    key={ws._id}
                    className="flex flex-col gap-4 items-center justify-between p-2 rounded-lg hover:bg-base-200 transition-colors"
                  >
                    {/* name and join button */}
                    <div className="flex justify-between w-full">
                      <span className="font-medium">{ws.name}</span>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          handleJoin(ws);
                        }}
                      >
                        Join
                      </button>
                    </div>
                    {/* password input */}
                    {ws.passwordRequired && (
                      <div className="flex w-full gap-4 items-center">
                        <span>Password</span>
                        <Input
                          type={"password"}
                          className={"input w-full"}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    )}
                    {/* error display */}
                    {joinError && <p className="text-error">{joinError}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* dialog close button */}
          <div className="absolute top-1 right-1 m-0">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost">✕</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default JoinWorkspaceModal;

import { useEffect, useState } from "react";
import useSocket from "../../zustand/socket.store";

const SocketInit = ({ user }) => {
  const { socket, isConnected, isReconnecting, setSocket, reconnect } =
    useSocket();
  const [isModalOpen, setIsModlOpen] = useState(false);
  useEffect(() => {
    if (!user || socket) return;
    setSocket(user);
  }, [user, socket, setSocket]);

  return (
    <>
      <button
        role="button"
        className={`fixed bottom-4 left-4 w-10 h-10 btn btn-lg btn-circle font-bold opacity-50 hover:opacity-100 transition-opacity ${
          isConnected
            ? "bg-success text-success-content"
            : "bg-error text-error-content"
        }`}
        onClick={() => {
          setIsModlOpen((prev) => {
            return !prev;
          });
        }}
      >
        S
      </button>
      {/* to be shown when above button is clicked */}
      <div
        className={`${
          isModalOpen ? "" : "hidden"
        } fixed bottom-4 left-4 z-50 border-base-content border-1 rounded-md shadow-xl`}
      >
        <span
          onClick={() => {
            setIsModlOpen((prev) => {
              return !prev;
            });
          }}
          className="absolute  left-2 z-99 cursor-pointer text-neutral-400"
        >
          x
        </span>
        <div className="card w-64 bg-base-200 shadow-xl">
          <div className="card-body p-4 gap-3">
            {/* Status row */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Socket</span>

              <span
                className={`badge ${
                  isReconnecting
                    ? "badge-warning"
                    : isConnected
                    ? "badge-success"
                    : "badge-error"
                }`}
              >
                {isReconnecting
                  ? "Reconnecting..."
                  : isConnected
                  ? "Connected"
                  : "Disconnected"}
              </span>
            </div>

            {/* Action */}
            {!isConnected && !isReconnecting && (
              <button
                className="btn btn-sm btn-primary w-full"
                onClick={reconnect}
              >
                Connect
              </button>
            )}
            {/* for testing */}
            {!isReconnecting && socket && (
              <button
                onClick={() => {
                  // using a custom event to close this socket's transport at the server since disconnect doesn't trigger reconnection and io.engine.close will just kill realtime delivery for all sockets
                  socket.emit("dis");
                }}
                className="btn btn-sm btn-error w-full"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SocketInit;

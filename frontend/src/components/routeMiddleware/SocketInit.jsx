import { useEffect } from "react";
import useSocket from "../../zustand/socket.store";

const SocketInit = ({ user }) => {
  const { socket, isConnected, setSocket, reconnect } = useSocket();

  useEffect(() => {
    if (!user || socket) return;
    setSocket(user);
  }, [user, socket, setSocket]);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="card w-64 bg-base-200 shadow-xl">
        <div className="card-body p-4 gap-3">
          {/* Status row */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Socket</span>

            <span
              className={`badge ${
                isConnected ? "badge-success" : "badge-error"
              }`}
            >
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          {/* Action */}
          {!isConnected && (
            <button
              className="btn btn-sm btn-primary w-full"
              onClick={reconnect}
            >
              Connect
            </button>
          )}
          {/* for testing */}
          <button
            onClick={() => {
              // using a custom event to close this socket's transport at the server since disconnect doesn't trigger reconnection and io.engine.close will just kill realtime delivery for all sockets
              socket.emit("dis");
            }}
            className="bg-error"
          >
            disconnect
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocketInit;

import { useEffect, useState } from "react";
import useSocket from "../../zustand/socket.store";

const WsGeneral = () => {
  const MAX_NOTIFICATIONS = 20; // no. of max notifications
  const [notifications, setNotifications] = useState([]);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handler = (notif) => {
      setNotifications((prev) => {
        // allow only 20 notifications to exist
        const next = [notif, ...prev];
        return next.slice(0, MAX_NOTIFICATIONS);
      });
    };

    socket.on("notification", handler);

    return () => {
      socket.off("notification", handler);
    };
  }, [socket]);
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <p className="p-4 text-md md:text-lg lg:text-xl xl:text-2xl font-semibold text-center shadow-md shrink-0">
        Workspace general notifications
      </p>

      {/* Scroll container */}
      <div className="p-4 flex-1 overflow-y-auto">
        {notifications.map((nf, idx) =>
          nf.type === "enter" || nf.type === "leave" ? (
            <div
              className="p-4 bg-base-200 rounded-md m-4 text-center  text-base md:text-lg lg:text-xl text-base-content/70"
              key={idx}
            >
              {nf.message}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

export default WsGeneral;

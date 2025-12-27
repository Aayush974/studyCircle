import { useEffect, useState } from "react";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { getMessage } from "../../api/message.api";
import useSocket from "../../zustand/socket.store";
import { enterRoom, leaveRoom } from "../../socket/socketController";
import useUser from "../../zustand/user.store";

const Room = ({ room, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const socket = useSocket((state) => state.socket);
  const user = useUser((state) => state.user);

  useEffect(() => {
    if (!socket || !user) return;
    (async () => {
      const res = await getMessage({
        targetId: room._id,
        targetType: "room",
      });
      if (!res.data) {
        return;
      }
      setMessages(res.data?.messages);
      enterRoom(room._id, user);
    })();

    return () => {
      leaveRoom(room._id, user);
    };
  }, [room, user]);

  useEffect(() => {
    if (!socket || !user) return;
    const handler = ({ message }) => {
      setMessages((prev) => [...prev, message]);
    };
    socket.on("chat:send-msg", handler);
    return () => {
      socket.off("chat:send-msg", handler);
    };
  }, [socket, user]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="navbar bg-base-200 px-4">
        <div className="flex-1">
          <span className="text-md md:text-lg lg:text-xl xl:text-2xl font-semibold text-base-content/70">
            {room?.name || "Chat Room"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center text-sm opacity-60">No messages yet</div>
        ) : (
          messages.map((msg) => (
            <Message
              key={msg._id}
              message={msg}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>

      {/* Input */}
      <MessageInput targetId={room._id} targetType={"room"} />
    </div>
  );
};

export default Room;

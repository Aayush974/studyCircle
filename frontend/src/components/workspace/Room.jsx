import { useEffect, useState } from "react";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { getMessage } from "../../api/message.api";

const Room = ({ room, currentUserId }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await getMessage({
        targetId: room._id,
        targetType: "studyRoom",
      });
      if (!res.data) {
        return;
      }
      setMessages(res.data?.messages);
    })();
  }, []);
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="navbar bg-base-200 px-4">
        <div className="flex-1">
          <span className="font-semibold">{room?.name || "Chat Room"}</span>
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
      <MessageInput targetId={room._id} targetType={"studyRoom"} />
    </div>
  );
};

export default Room;

import { useState } from "react";
import Message from "./Message";

const Room = ({ room, currentUserId }) => {
  const [messages, setMessages] = useState([]);
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
      <div className="p-3 border-t border-base-300">
        <div className="join w-full">
          <input
            type="text"
            placeholder="Type a message"
            className="input input-bordered join-item w-full"
          />
          <button className="btn btn-primary join-item">Send</button>
        </div>
      </div>
    </div>
  );
};

export default Room;

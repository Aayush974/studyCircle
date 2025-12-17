const Message = ({ message, currentUserId }) => {
  const isOwn = message.senderId === currentUserId;

  return (
    <div className={`chat ${isOwn ? "chat-end" : "chat-start"}`}>
      <div className="chat-header text-xs opacity-70">{message.senderName}</div>

      <div className={`chat-bubble ${isOwn ? "chat-bubble-primary" : ""}`}>
        {message.text}
      </div>

      <div className="chat-footer text-[10px] opacity-50">
        {new Date(message.createdAt).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default Message;

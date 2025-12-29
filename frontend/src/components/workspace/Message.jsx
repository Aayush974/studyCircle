import { getDownloadLink, getThumbnailLink } from "../../utils/cloudinaryLink";
import { FaFilePdf } from "react-icons/fa6";
import { FaUserCircle } from "react-icons/fa";

const Message = ({ message, currentUserId }) => {
  const isOwn = message.sender._id === currentUserId;
  const hasAttachments = message.attachments && message.attachments.length > 0;

  return (
    <div
      className={`chat flex flex-col gap-1 ${
        isOwn ? "chat-end" : "chat-start"
      }`}
    >
      {/* HEADER: Avatar + Username */}
      <div
        className={`flex items-center gap-2 mb-1 ${
          isOwn ? "justify-end" : "justify-start"
        }`}
      >
        {!isOwn && (
          <>
            {message.sender?.avatar ? (
              <img
                src={message.sender.avatar}
                alt={message.sender.username}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <FaUserCircle className="w-6 h-6 text-gray-400" />
            )}

            <span className="text-xs font-medium text-gray-500">
              {message.sender?.username || "user"}
            </span>
          </>
        )}
      </div>

      {/* MESSAGE BUBBLE */}
      <div
        className={`chat-bubble ${
          isOwn ? "chat-bubble-primary" : ""
        } flex flex-col gap-2`}
      >
        {/* TEXT CONTENT */}
        {message.content && (
          <div className="text-base lg:text-lg">{message.content}</div>
        )}

        {/* ATTACHMENTS */}
        {hasAttachments && (
          <div className="flex flex-col gap-2 lg:gap-4 pt-1">
            {message.attachments.map((file, idx) => {
              let thumbUrl;
              if (file.fileType === "image")
                thumbUrl = getThumbnailLink(file.publicId);

              const downloadUrl = getDownloadLink(file.fileType, file.publicId);

              return (
                <a
                  key={idx}
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:opacity-80"
                >
                  {file.fileType === "image" ? (
                    <img
                      src={thumbUrl}
                      alt={file.fileName}
                      className="w-6 h-6 object-cover rounded-sm"
                    />
                  ) : (
                    <FaFilePdf className="w-6 h-6" />
                  )}

                  <span className="text-xs md:text-sm max-w-[120px] truncate">
                    {file.fileName}
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER: Timestamp */}
      <div className="chat-footer text-[10px] opacity-50">
        {new Date(message.createdAt).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default Message;

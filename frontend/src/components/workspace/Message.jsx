import { getDownloadLink, getThumbnailLink } from "../../utils/cloudinaryLink";
import { FaFilePdf } from "react-icons/fa6";

const Message = ({ message, currentUserId }) => {
  const isOwn = message.senderId === currentUserId;
  const hasAttachments = message.attachments && message.attachments.length > 0;

  return (
    <div className={`chat ${isOwn ? "chat-end" : "chat-start"}`}>
      <div
        className={`chat-bubble ${
          isOwn ? "chat-bubble-primary" : ""
        } flex flex-col gap-2`}
      >
        {/* TOP: TEXT CONTENT */}
        {message.content && (
          <div className="text-base lg:text-lg">{message.content}</div>
        )}

        {/* BOTTOM: ATTACHMENTS SECTION */}
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
                  className="flex items-center gap-2 hover:opacity-80 cursor-pointer"
                >
                  {/* Thumbnail */}
                  {file.fileType === "image" ? (
                    <img
                      src={thumbUrl}
                      alt={file.fileName}
                      className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 object-cover rounded-sm"
                    />
                  ) : (
                    <span className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8">
                      <FaFilePdf className="w-full h-full" />
                    </span>
                  )}

                  {/* Filename clipped */}
                  <span className="text-xs md:text-sm lg:text-base max-w-[120px] truncate">
                    {file.fileName}
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>

      <div className="chat-footer text-[10px] opacity-50">
        {new Date(message.createdAt).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default Message;

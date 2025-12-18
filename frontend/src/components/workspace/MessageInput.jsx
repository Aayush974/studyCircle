import { useState } from "react";
import { useForm } from "react-hook-form";
import { createMessage } from "../../api/message.api";

const MessageInput = ({ targetId, targetType }) => {
  const { register, handleSubmit, reset } = useForm();
  const [attachments, setAttachments] = useState([]);

  const addAttachment = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    const fd = new FormData();
    fd.append("content", data.content);
    fd.append("targetId", targetId);
    fd.append("targetType", targetType);

    for (const attachment of attachments) {
      if (attachment.type === "application/pdf") {
        fd.append("pdf", attachment);
      }
      if (attachment.type.includes("image/")) {
        fd.append("images", attachment);
      }
    }

    await createMessage(fd);

    reset();
    setAttachments([]);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-3 border-t border-base-300"
    >
      <div className="flex items-center gap-2 w-full">
        <label htmlFor="file" className="btn btn-ghost btn-circle">
          <span className="w-5 h-5">+</span>
        </label>

        <input
          id="file"
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={addAttachment}
          className="hidden"
        />

        {/* Container for text + file list */}
        <div
          className="flex flex-col border rounded-lg p-2 w-full max-h-32 overflow-hidden"
          style={{ minHeight: "3.5rem" }}
        >
          {/* Text input */}
          <input
            {...register("content")}
            type="text"
            placeholder="Type a message"
            className="outline-none border-none flex-1"
          />

          {/* File names section */}
          {attachments.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2 overflow-y-auto max-h-16 pr-1">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-base-200 border rounded-md px-2 py-1 text-sm"
                >
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <button
                    type="button"
                    className="text-error font-bold"
                    onClick={() => removeAttachment(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary">
          Send
        </button>
      </div>
    </form>
  );
};

export default MessageInput;

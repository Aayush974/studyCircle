import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    senderId: {
      type: String,
      required: true,
    },
    targetId: {
      type: String,
      required: true,
    },
    targetType: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: ["workspace", "studyroom", "user"],
    },
    attachments: [
      {
        fileUrl: {
          type: String,
          required: true,
        },
        fileType: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
          enum: ["pdf", "image"],
        },
        fileName: {
          type: String,
          required: true,
        },
        fileSize: {
          type: Number,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

messageSchema.index({
  targetId: 1,
  targetType: 1,
  createdAt: -1,
});

messageSchema.index({
  senderId: 1,
});

const Message = mongoose.model("Message", messageSchema);

export { Message };

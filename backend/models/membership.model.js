// the membership schema is used to keep record of the joining of users happening in studyCircles/workspaces
import mongoose from "mongoose";
import { Workspace } from "./workspace.model.js";

const membershipSchema = new mongoose.Schema(
  {
    userId: {
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
      enum: ["workspace", "studyCircle"],
    },
    role: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: ["owner", "admin", "member"],
    },
  },
  {
    timestamps: true,
  }
);

const Membership = mongoose.model("Membership", membershipSchema);

export { Membership };

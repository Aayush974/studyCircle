import mongoose, { mongo } from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    logo: {
      type: String,
    },
    passwordRequired: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Workspace = mongoose.model("Workspace", workspaceSchema);

export { Workspace };

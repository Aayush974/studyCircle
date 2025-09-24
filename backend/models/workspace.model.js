import mongoose, { mongo } from "mongoose";
import bcrypt from "bcrypt";
const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 4,
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
      trim: true,
      minLength: 5,
      match: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{5,}$/,
    },
  },
  {
    timestamps: true,
  }
);

// hashing the password
workspaceSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (!this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

//method to validate the password
workspaceSchema.methods.validatePassword = async function (userPassword) {
  const isValid = await bcrypt.compare(userPassword, this.password);
  return isValid;
};

const Workspace = mongoose.model("Workspace", workspaceSchema);

export { Workspace };

import mongoose from "mongoose";
import moment from "moment";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    profilePic: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    points: {
      type: String,
      required: false,
    },
    date: {
      type: Date,
      required: false,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: false,
    },
	doctorId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Date",
		required: false,
	},
	sickId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Date",
		required: false,
	},
  },
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);

export default User;

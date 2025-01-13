import mongoose from "mongoose";
import moment from "moment";

// Define the schema for the date model
const dateSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sickId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    deadline: {
      type: Date,
      required: false,
    },
    price: {
      type: String,
      required: false,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// Add a method to format the date
dateSchema.methods.formatDate = function () {
  return moment(this.date).format("DD/MM/YYYY HH:mm");
};

// Create and export the model
const DateModel = mongoose.model("Date", dateSchema);

export default DateModel;

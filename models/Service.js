const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter service name"],
      trim: true,
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    type: {
      type: String,
      enum: ["First Service", "Second Service", "Wedding", "Thanks Giving", "Others"],
    },
    date: {
      type: String,
      required: [true, "Please enter service date"],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Service || mongoose.model("Service", ServiceSchema);

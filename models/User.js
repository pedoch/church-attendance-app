const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please enter first name"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Please enter last name"],
    trim: true,
  },
  email: {
    type: String,
    default: null,
    trim: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: [true, "Please enter phone number"],
    unique: true,
  },
});

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);

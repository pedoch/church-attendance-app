const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please enter first name."],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Please enter last name."],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please enter email."],
    trim: true,
  },
  type: {
    type: String,
    enum: ['Super Admin', 'Admin'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Pending'],
    required: true,
  },
  password: {
    type: String,
    required: [true, "Please enter password."],
  },
});

module.exports = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

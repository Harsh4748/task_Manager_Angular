const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"]
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Email is required"],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: [true, "Password is required"]
  },

  // 🔐 ACTIVE JWT TOKEN
  token: {
    type: String,
    default: null
  },
  otp: String,
  otpExpire: Date
});

module.exports = mongoose.model("User", userSchema);

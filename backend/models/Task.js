const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: true
  },

   assignedTo: {
    type: mongoose.Schema.Types.ObjectId,   // ⭐ change
    ref: "User",
    required: true
  },

  category: {
    type: String,
    required: true
  },

  date: {
    type: Date,
    required: true
  },

  completed: {
    type: Boolean,
    default: false
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);

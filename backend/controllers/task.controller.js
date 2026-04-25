const Task = require("../models/Task");
const sendemail = require("../config/sendmail");
const User = require("../models/User");
exports.addTask = async (req, res) => {
  try {
    console.time('DB_AddTask');
    const assignedUser = await User.findOne({
      email: req.body.assignedTo
    });

    if (!assignedUser) {
      console.timeEnd('DB_AddTask');
      return res.status(400).json({
        message: "Assigned user not found"
      });
    }

    const task = await Task.create({
      taskName: req.body.taskName,
      category: req.body.category,
      date: req.body.date,
      userId: req.user.id,
      assignedTo: assignedUser._id
    });
    console.timeEnd('DB_AddTask');

    // ✅ Send Task Email to Assigned User (Background)
    sendemail(
      req.body.assignedTo,
      "📌 New Task Assigned",
      `
        <h2>Hello 👋</h2>
        <p>You have been assigned a new task:</p>

        <b>Task:</b> ${task.taskName}<br/>
        <b>Category:</b> ${task.category}<br/>
        <b>Date:</b> ${task.date}<br/>

        <br/>
        <p>Task Manager App</p>
      `
    ).catch(emailError => {
      console.error("Email sending failed:", emailError);
    });

    req.io.emit('taskUpdated', { action: 'add', task });

    res.json({
      message: "Task Added successfully",
      task
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during task addition" });
  }
};

exports.getTasks = async (req, res) => {
  try {
    console.time('DB_GetTasks');
    const tasks = await Task.find({
      $or: [
        { userId: req.user.id },
        { assignedTo: req.user.id }
      ]
    }).populate("assignedTo", "name email")
      .sort({ createdAt: -1 });
    console.timeEnd('DB_GetTasks');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id // Only creator can update full task
      },
      req.body,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    req.io.emit('taskUpdated', { action: 'update', task });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error updating task" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const result = await Task.deleteOne({
      _id: req.params.id,
      userId: req.user.id // Only creator can delete
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Task not found or unauthorized" });
    }

    req.io.emit('taskUpdated', { action: 'delete', id: req.params.id });

    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task" });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    await Task.deleteMany({ userId: req.user.id });
    res.json({ message: "All your created tasks deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting all tasks" });
  }
};

exports.toggleComplete = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.user.id },
        { assignedTo: req.user.id }
      ]
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.completed = !task.completed;
    await task.save();

    req.io.emit('taskUpdated', { action: 'toggle', task });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error toggling task completion" });
  }
};
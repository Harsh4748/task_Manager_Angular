const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const task = require("../controllers/task.controller");

router.post("/add", auth, task.addTask);
router.get("/list", auth, task.getTasks);
router.put("/update/:id", auth, task.updateTask);
router.delete("/delete/:id", auth, task.deleteTask);
router.delete("/delete-all", auth, task.deleteAll);
router.patch("/toggle/:id", auth, task.toggleComplete);

module.exports = router;

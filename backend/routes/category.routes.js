const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const category = require("../controllers/category.controller");

router.get("/list", auth, category.getCategories);
router.post("/add", auth, category.addCategory);

module.exports = router;

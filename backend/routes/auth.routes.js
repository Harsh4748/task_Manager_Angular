const router = require("express").Router();
const auth = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
router.post("/signup", auth.signup);
router.post("/login", auth.login);
router.post("/forgot-password",auth.forgotPassword);
router.post("/verify-otp", auth.verifyOtp);
router.post("/reset-password", auth.resetPassword);
router.post("/logout", authMiddleware, auth.logout);
router.get("/userdetails", authMiddleware, auth.userdetails);
router.get("/all-users", authMiddleware, auth.getAllUsers);

module.exports = router;

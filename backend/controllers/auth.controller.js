const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendemail = require("../config/sendmail");
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!password || !passwordRegex.test(password)) {
      return res.status(400).json({ error: "Password must be 6+ chars with 1 uppercase, 1 lowercase, and 1 number" });
    }

    // 🔎 check email exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: "Email already registered"
      });
    }

    // 🔐 hash password
    const hash = await bcrypt.hash(password, 10);

    // ✅ create user
    await User.create({
      name,
      email,
      password: hash
    });

    res.status(201).json({
      message: "Signup successful"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Server error"
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({
        error: "User not found"
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({
        error: "Invalid email or password"
      });

    // generate new token
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // store token
    user.token = token;
    await user.save();

    // cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // set to true in production
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: "Login successful",
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during login" });
  }
};

exports.logout = async (req, res) => {
  try {
    // Clear token in DB for this user
    await User.findByIdAndUpdate(req.user.id, { token: null });

    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error during logout" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({
        error: "Email not registered"
      });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;

    await user.save();

    await sendemail(
      email,
      "Password Reset OTP",
      `
        <h2>Password Reset</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>Valid for 5 minutes</p>
      `
    );

    res.json({
      message: "OTP sent to your email"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during forgot password" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      otp,
      otpExpire: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({
        error: "Invalid or expired OTP"
      });

    res.json({
      message: "OTP verified"
    });
  } catch (error) {
    res.status(500).json({ error: "Server error during OTP verification" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    const user = await User.findOne({
      email,
      otp,
      otpExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired OTP session for password reset"
      });
    }

    const hash = await bcrypt.hash(password, 10);

    user.password = hash;
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    res.json({
      message: "Password reset successful"
    });
  } catch (error) {
    res.status(500).json({ error: "Server error during password reset" });
  }
};

exports.userdetails = (req, res) => {
  res.json({
    user: req.user
  });
};

exports.getAllUsers = async (req, res) => {
  try {

    // ✅ Current logged-in user exclude
    const users = await User.find({
      _id: { $ne: req.user.id }
    }).select("email name");

    res.json(users);

  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};


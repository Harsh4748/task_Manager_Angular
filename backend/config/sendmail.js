const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ✅ Universal Mail Sender (OTP + Task Email)
module.exports = async (to, subject, html) => {

  await transporter.sendMail({
    from: `"Task Manager" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });

};
const nodemailer = require("nodemailer");
const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: `UniLink <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully");
  } catch (err) {
    console.error("❌ Email error:", err);
    console.log("\n--- OTP FALLBACK ---");
    console.log(`To: ${options.email}`);
    console.log(`Message: ${options.message}`);
    console.log("--------------------\n");
  }
};
module.exports = sendEmail;

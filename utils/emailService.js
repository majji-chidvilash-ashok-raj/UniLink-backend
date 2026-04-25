const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail
    pass: process.env.EMAIL_PASS  // Your App Password
  }
});

exports.sendRegistrationEmail = async (userEmail, userName, eventName, eventDate, eventLocation) => {
  try {
    const mailOptions = {
      from: `"UniLink Events" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Registration Confirmed: ${eventName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">UniLink</h1>
          </div>
          <div style="padding: 30px; background: white;">
            <h2 style="color: #1e293b; margin-top: 0;">Registration Confirmed!</h2>
            <p style="color: #475569; line-height: 1.6;">Hello <strong>${userName}</strong>,</p>
            <p style="color: #475569; line-height: 1.6;">You have successfully registered for <strong>${eventName}</strong>. We're excited to have you join us!</p>
            
            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="margin-top: 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Event Details</h3>
              <p style="margin: 8px 0; color: #1e293b;"><strong>📅 Date:</strong> ${eventDate}</p>
              <p style="margin: 8px 0; color: #1e293b;"><strong>📍 Location:</strong> ${eventLocation}</p>
            </div>

            <p style="color: #475569; line-height: 1.6;">Don't forget to mark your calendar. You can view more details and check-in via the UniLink app.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
              This is an automated message from UniLink. Please do not reply to this email.
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Registration email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send registration email:', error);
    return false;
  }
};

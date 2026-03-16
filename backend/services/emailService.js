const nodemailer = require('nodemailer');

const getEmailUser = () => (process.env.EMAIL_USER || '').trim();
const getEmailPass = () => (process.env.EMAIL_PASS || '').trim();
const getEmailFrom = () => (process.env.EMAIL_FROM || '').trim();

let cachedTransporter = null;
const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  const user = getEmailUser();
  const pass = getEmailPass();
  if (!user || !pass) {
    console.error('SMTP error: Missing EMAIL_USER or EMAIL_PASS');
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  return cachedTransporter;
};

const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      return false;
    }

    const from = getEmailFrom() || getEmailUser();
    if (!from) {
      console.error('SMTP error: Missing EMAIL_FROM/EMAIL_USER');
      return false;
    }

    console.log('Attempting to send OTP to:', email);

    await transporter.sendMail({
      from,
      to: email,
      subject: 'Email Verification OTP - ERP System',
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding:20px;">
          <h2 style="color:#2563eb;">ERP System Email Verification</h2>
          <p>Hello,</p>
          <p>Your OTP code is:</p>
          <div style="
            font-size:28px;
            font-weight:bold;
            letter-spacing:6px;
            margin:20px 0;
            color:#111827;
          ">
            ${otp}
          </div>
          <p>This OTP will expire in <strong>5 minutes</strong>.</p>
          <p>If you did not create this account, please ignore this email.</p>
          <hr style="margin:20px 0"/>
          <p style="font-size:12px;color:#6b7280;">
            If the email appears in your spam folder, please mark it as
            "Not Spam" so future emails arrive in your inbox.
          </p>
          <p style="font-size:12px;color:#6b7280;">
            ERP System Team
          </p>
        </div>
      `,
    });

    console.log('SMTP send OK');
    return true;
  } catch (sendError) {
    console.error('SMTP error:', sendError?.message || sendError);
    return false;
  }
};

module.exports = { sendOTPEmail };

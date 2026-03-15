const sgMail = require('@sendgrid/mail');

const getSendgridApiKey = () => (process.env.SENDGRID_API_KEY || '').trim();
const getEmailFrom = () => (process.env.EMAIL_FROM || '').trim();

let sendgridInitialized = false;
const ensureSendgridInitialized = () => {
  if (sendgridInitialized) return true;
  const apiKey = getSendgridApiKey();
  if (!apiKey) {
    console.error('SendGrid error: Missing SENDGRID_API_KEY');
    return false;
  }
  sgMail.setApiKey(apiKey);
  sendgridInitialized = true;
  return true;
};

const sendOTPEmail = async (email, otp) => {
  try {
    const initialized = ensureSendgridInitialized();
    if (!initialized) {
      return false;
    }

    const from = getEmailFrom();
    if (!from) {
      console.error('SendGrid error: Missing EMAIL_FROM');
      return false;
    }

    console.log('Attempting to send OTP to:', email);

    const msg = {
      to: email,
      from,
      subject: 'Verify your email for ERP System',
      text: `Your OTP code is ${otp}. This OTP will expire in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding:20px;">
          <h2 style="color:#2563eb;">ERP System Email Verification</h2>
          <p>Hello,</p>
          <p>To complete your signup, please use the One-Time Password (OTP) below:</p>
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
          <p>If you did not request this verification, please ignore this email.</p>
          <hr style="margin:20px 0"/>
          <p style="font-size:12px;color:#6b7280;">
            If the email appears in your spam folder, please mark it as
            "Not Spam" so future emails arrive in your inbox.
          </p>
          <p style="font-size:12px;color:#6b7280;">
            ERP System – Secure Business Management Platform
          </p>
        </div>
      `
    };

    const response = await sgMail.send(msg);
    console.log('SendGrid response status:', response?.[0]?.statusCode);
    return true;
  } catch (sendError) {
    console.error('SendGrid error:', sendError.response?.body || sendError.message);
    return false;
  }
};

module.exports = { sendOTPEmail };

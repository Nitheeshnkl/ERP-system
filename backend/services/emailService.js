const sgMail = require('@sendgrid/mail');

const getSendgridApiKey = () => {
  const apiKey = (process.env.SENDGRID_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('Missing required environment variable: SENDGRID_API_KEY');
  }
  return apiKey;
};

const getEmailFrom = () => {
  const from = (process.env.EMAIL_FROM || '').trim();
  if (!from) {
    throw new Error('Missing required environment variable: EMAIL_FROM');
  }
  return from;
};

let sendgridInitialized = false;
const ensureSendgridInitialized = () => {
  if (sendgridInitialized) return;
  const apiKey = getSendgridApiKey();
  sgMail.setApiKey(apiKey);
  sendgridInitialized = true;
};

const sendOTPEmail = async (email, otp) => {
  try {
    ensureSendgridInitialized();
    const msg = {
      to: email,
      from: getEmailFrom(),
      subject: 'ERP System Email Verification OTP',
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP for ERP signup is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
      `
    };

    await sgMail.send(msg);
  } catch (sendError) {
    console.error('SendGrid OTP email error:', sendError);
    throw new Error('Failed to send OTP email');
  }
};

module.exports = {
  sendOTPEmail
};

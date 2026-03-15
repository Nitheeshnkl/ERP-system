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

const sendVerificationEmail = async (email, verificationUrl) => {
  try {
    ensureSendgridInitialized();
    const msg = {
      to: email,
      from: getEmailFrom(),
      subject: 'Verify your ERP account',
      html: `
        <h2>Welcome to ERP System</h2>
        <p>Please verify your email to activate your account.</p>
        <a href="${verificationUrl}" style="
          padding:10px 20px;
          background:#2563eb;
          color:white;
          text-decoration:none;
          border-radius:6px;
        ">
          Verify Email
        </a>
      `
    };

    await sgMail.send(msg);
  } catch (sendError) {
    console.error('SendGrid verification email error:', sendError);
    throw new Error('Failed to send verification email');
  }
};

module.exports = {
  sendVerificationEmail
};

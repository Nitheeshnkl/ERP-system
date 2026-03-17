const SibApiV3Sdk = require('sib-api-v3-sdk');

const getBrevoApiKey = () => (process.env.BREVO_API_KEY || '').trim();
const getBrevoSenderEmail = () => (process.env.BREVO_SENDER_EMAIL || '').trim();
const getBrevoSenderName = () => (process.env.BREVO_SENDER_NAME || '').trim();

let cachedApiInstance = null;
const getBrevoApi = () => {
  if (cachedApiInstance) return cachedApiInstance;

  const apiKey = getBrevoApiKey();
  if (!apiKey) {
    console.error('BREVO error: Missing BREVO_API_KEY');
    return null;
  }

  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKeyAuth = defaultClient.authentications['api-key'];
  apiKeyAuth.apiKey = apiKey;
  cachedApiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  return cachedApiInstance;
};

const sendOTPEmail = async (email, otp) => {
  try {
    const apiInstance = getBrevoApi();
    if (!apiInstance) {
      return false;
    }

    const fromEmail = getBrevoSenderEmail();
    const fromName = getBrevoSenderName();
    if (!fromEmail || !fromName) {
      throw new Error('Missing BREVO_SENDER_EMAIL or BREVO_SENDER_NAME');
    }

    console.log('[MAIL] sending OTP', { email });

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = { email: fromEmail, name: fromName };
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.subject = 'Verify your email';
    sendSmtpEmail.textContent = [
      `Your verification code is ${otp}.`,
      '',
      'This code will expire in 5 minutes.',
      'If you did not request this code please ignore this email.',
    ].join('\n');
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="margin: 0 0 12px;">Verify your email</h2>
        <p>Your OTP code:</p>
        <h1 style="letter-spacing: 6px; margin: 12px 0;">${otp}</h1>
        <p>This code expires in 5 minutes.</p>
        <p>If you did not request this code please ignore this email.</p>
      </div>
    `;
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log('[MAIL] success', response);
    return true;
  } catch (sendError) {
    const responsePayload = sendError?.response?.body || sendError?.response || sendError;
    console.error('[MAIL ERROR]', responsePayload);
    return false;
  }
};

module.exports = { sendOTPEmail };

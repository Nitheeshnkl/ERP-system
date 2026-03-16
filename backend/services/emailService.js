const nodemailer = require('nodemailer');

const getEmailUser = () => (process.env.EMAIL_USER || '').trim();
const getEmailPass = () => (process.env.EMAIL_PASS || '').trim();
const getEmailFrom = () => (process.env.EMAIL_FROM || '').trim();
const getSmtpTimeoutMs = () => {
  const raw = Number(process.env.SMTP_TIMEOUT_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : 20000;
};

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
    connectionTimeout: getSmtpTimeoutMs(),
    greetingTimeout: getSmtpTimeoutMs(),
    socketTimeout: getSmtpTimeoutMs(),
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

    console.log('[MAIL] sending OTP', { email });

    const mailOptions = {
      from,
      to: email,
      subject: 'ERP System Verification Code',
      text: [
        `Your ERP System verification code is ${otp}.`,
        '',
        'This code will expire in 5 minutes.',
        'If you did not request this code please ignore this email.',
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="margin: 0 0 12px;">ERP System Verification</h2>
          <p>Your OTP code:</p>
          <h1 style="letter-spacing: 6px; margin: 12px 0;">${otp}</h1>
          <p>This code expires in 5 minutes.</p>
          <p>If you did not request this code please ignore this email.</p>
        </div>
      `,
    };

    const timeoutMs = getSmtpTimeoutMs();
    const sendPromise = transporter.sendMail(mailOptions);
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`SMTP timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    await Promise.race([sendPromise, timeoutPromise]).finally(() => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    });

    console.log('[MAIL] success');
    return true;
  } catch (sendError) {
    console.error('[MAIL] error', sendError?.message || sendError);
    return false;
  }
};

module.exports = { sendOTPEmail };

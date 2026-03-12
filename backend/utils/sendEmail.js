const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

const sendVerificationEmail = async (email, otp) => {
  try {
    await transporter.verify();
    await transporter.sendMail({
      from: `"ERP System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'ERP Account Verification',
      text: `Hello,

Your verification code is:

${otp}

This code will expire in 10 minutes.`,
    });
  } catch (error) {
    console.error('SMTP send error:', error);
    throw new Error('Email service temporarily unavailable');
  }
};

module.exports = {
  sendVerificationEmail,
};

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'ERP Account Verification',
    text: `Hello,

Your verification code is:

${otp}

This code will expire in 10 minutes.`,
  });
};

module.exports = {
  sendVerificationEmail,
};

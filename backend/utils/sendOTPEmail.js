const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (email, otp) => {
  try {
    const response = await resend.emails.send({
      from: 'ERP System <onboarding@resend.dev>',
      to: email,
      subject: 'ERP Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif">
          <h2>Verify your ERP account</h2>
          <p>Your OTP code is:</p>
          <h1>${otp}</h1>
          <p>This code expires in 10 minutes.</p>
        </div>
      `
    });

    return response;
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send verification email');
  }
};

module.exports = {
  sendOTPEmail,
};

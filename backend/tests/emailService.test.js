jest.mock('sib-api-v3-sdk', () => {
  const sendTransacEmail = jest.fn().mockResolvedValue({ messageId: '1' });
  class SendSmtpEmail {
    constructor() {
      this.sender = null;
      this.to = null;
      this.subject = '';
      this.textContent = '';
      this.htmlContent = '';
    }
  }
  return {
    ApiClient: { instance: { authentications: { 'api-key': {} } } },
    TransactionalEmailsApi: jest.fn().mockImplementation(() => ({ sendTransacEmail })),
    SendSmtpEmail,
  };
});

const { sendOTPEmail } = require('../services/emailService');

describe('emailService', () => {
  beforeEach(() => {
    process.env.BREVO_API_KEY = '';
    process.env.BREVO_SENDER_EMAIL = 'noreply@test.com';
    process.env.BREVO_SENDER_NAME = 'ERP';
  });

  it('returns false when API key missing', async () => {
    const result = await sendOTPEmail('a@test.com', '123456');
    expect(result).toBe(false);
  });

  it('sends OTP email when configured', async () => {
    process.env.BREVO_API_KEY = 'key';
    const result = await sendOTPEmail('a@test.com', '123456');
    expect(result).toBe(true);
  });
});

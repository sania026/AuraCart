import nodemailer from 'nodemailer';

export const getTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass || emailUser.includes('your_') || emailPass.includes('your_')) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

export const verifyEmailConfig = async () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  console.log('Verifying Email configuration...');
  
  if (!emailUser && !emailPass) {
    console.warn('EMAIL_USER and EMAIL_PASS environment variables are missing.');
    console.warn('SMTP service is disabled. Mock emails will be output to console instead.');
    return;
  }
  if (!emailUser) {
    console.warn('EMAIL_USER environment variable is missing.');
    console.warn('SMTP service is disabled. Mock emails will be output to console instead.');
    return;
  }
  if (!emailPass) {
    console.warn('EMAIL_PASS environment variable is missing.');
    console.warn('SMTP service is disabled. Mock emails will be output to console instead.');
    return;
  }

  if (emailUser.includes('your_') || emailPass.includes('your_')) {
    console.warn('EMAIL_USER or EMAIL_PASS contain placeholder values.');
    console.warn('SMTP service is disabled. Mock emails will be output to console instead.');
    return;
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Transporter could not be created.');
    return;
  }

  try {
    await transporter.verify();
    console.log('SMTP authentication succeeded: Connection verified successfully.');
  } catch (error) {
    console.error('SMTP authentication failed!');
    console.error(`Error details: ${error.message}`);
    console.error('Please use a Gmail App Password instead of your Gmail password.');
  }
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.log('\n=====================================================');
    console.log(`[DEVELOPER MOCK EMAIL SENT]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content:\n${text}`);
    console.log('=====================================================\n');
    return { mock: true };
  }

  const mailOptions = {
    from: `"AuraCart Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;


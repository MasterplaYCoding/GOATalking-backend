import nodemailer from 'nodemailer';

export const sendSecurityEmail = async (to: string, subject: string, text: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log(`✅ Email sent successfully via Brevo to ${to}`);
    return info;
  } catch (error) {
    console.error("❌ CRITICAL EMAIL ERROR:", error);
    throw error;
  }
};
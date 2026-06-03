import nodemailer from 'nodemailer';

export const sendSecurityEmail = async (to: string, subject: string, text: string) => {
  console.log(`🔍 DEBUG CONFIG: Host=[${process.env.SMTP_HOST}] Port=[${process.env.SMTP_PORT}] User=[${process.env.EMAIL_USER}]`);

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.SMTP_PORT as string) || 2525,
      secure: false, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: 'mateiursache2710@gmail.com',
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
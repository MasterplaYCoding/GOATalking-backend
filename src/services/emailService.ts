import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendSecurityEmail = async (to: string, subject: string, text: string) => {
  try {
    await transporter.sendMail({
      from: `"GOATalking Security" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log(`✅ Real email successfully sent to ${to}`);
  } catch (error) {
    console.error("❌ Failed to send real email:", error);
  }
};
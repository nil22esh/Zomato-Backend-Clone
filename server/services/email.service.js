import nodemailer from "nodemailer";
import dotenv from "dotenv";
import logger from "../utils/logger.js";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `${process.env.APP_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent: ${info.messageId}`);
  } catch (error) {
    logger.error("Email send error:", error);
    throw error;
  }
};

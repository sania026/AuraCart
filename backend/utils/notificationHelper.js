import Notification from '../models/notification.model.js';
import sendEmail from './sendEmail.js';

export const sendNotificationAndEmail = async ({
  user,
  email,
  subject,
  title,
  message,
  type,
  data,
  isAdmin = false,
}) => {
  try {
    // 1. Create In-App Notification in MongoDB
    await Notification.create({
      user: user || undefined,
      isAdmin,
      title,
      message,
      type,
      data,
    });

    // 2. Send transaction email if email address is provided
    if (email) {
      await sendEmail({
        to: email,
        subject: subject || title,
        text: message,
        html: `
          <div style="font-family: sans-serif; padding: 25px; border: 1px solid #e5e7eb; border-radius: 12px; max-width: 580px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 25px;">
              <h1 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">AuraCart</h1>
            </div>
            <div style="border-top: 2px solid #f3f4f6; padding-top: 25px;">
              <h2 style="color: #111827; margin: 0 0 15px 0; font-size: 18px; font-weight: 700;">${title}</h2>
              <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin: 0 0 25px 0;">${message}</p>
            </div>
            <div style="border-top: 1px solid #f3f4f6; padding-top: 15px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; 2026 AuraCart Inc. All rights reserved.</p>
              <p style="color: #9ca3af; font-size: 11px; margin: 5px 0 0 0;">This is an automated transactional notification regarding your account.</p>
            </div>
          </div>
        `,
      });
    }
  } catch (error) {
    // Log error, but do not crash the request lifecycle
    console.error(`Error sending notification/email alert: ${error.message}`);
  }
};

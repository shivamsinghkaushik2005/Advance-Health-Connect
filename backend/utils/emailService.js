import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send an appointment confirmation email to the patient
 * @param {string} recipientEmail - Patient's email address
 * @param {Object} appointment - Appointment object
 * @returns {Promise}
 */
export const sendAppointmentConfirmationEmail = async (recipientEmail, appointment) => {
  // Check if email service is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Email service not configured. Skipping email notification.');
    return;
  }

  // Format date
  const appointmentDate = new Date(appointment.appointmentDate);
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mailOptions = {
    from: `"Health Connect" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: 'Appointment Confirmation | Health Connect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2563eb; text-align: center;">Health Connect</h2>
        <h3 style="color: #333;">Your Appointment is Confirmed!</h3>
        <p>Dear Patient,</p>
        <p>Your appointment has been successfully scheduled for:</p>
        <div style="background-color: #f5f7ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${appointment.startTime} to ${appointment.endTime}</p>
          <p><strong>Status:</strong> ${appointment.status}</p>
          <p><strong>Symptoms:</strong> ${appointment.symptoms || 'None specified'}</p>
        </div>
        <p>If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
        <p style="margin-top: 30px;">Thank you for choosing Health Connect for your healthcare needs.</p>
        <p>Best regards,</p>
        <p>The Health Connect Team</p>
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send a reminder email for upcoming appointments
 * @param {string} recipientEmail - Patient's email address
 * @param {Object} appointment - Appointment object
 * @returns {Promise}
 */
export const sendAppointmentReminderEmail = async (recipientEmail, appointment, doctorName) => {
  // Check if email service is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Email service not configured. Skipping email notification.');
    return;
  }

  // Format date
  const appointmentDate = new Date(appointment.appointmentDate);
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mailOptions = {
    from: `"Health Connect" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: 'Appointment Reminder | Health Connect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2563eb; text-align: center;">Health Connect</h2>
        <h3 style="color: #333;">Appointment Reminder</h3>
        <p>Dear Patient,</p>
        <p>This is a friendly reminder about your upcoming appointment with Dr. ${doctorName}:</p>
        <div style="background-color: #f5f7ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${appointment.startTime} to ${appointment.endTime}</p>
        </div>
        <p>Please arrive 10 minutes before your scheduled time.</p>
        <p style="margin-top: 30px;">Thank you for choosing Health Connect for your healthcare needs.</p>
        <p>Best regards,</p>
        <p>The Health Connect Team</p>
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

export default {
  sendAppointmentConfirmationEmail,
  sendAppointmentReminderEmail
}; 
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'localhost';
const SMTP_PORT = Number(process.env.SMTP_PORT || 1025);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || 'noreply@aureon9.com';

// Create transporter - defaults to local development mailhog server
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

/**
 * Send verification email
 */
export async function sendVerificationEmail(email, verificationToken, userId) {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}&userId=${userId}`;
  
  return transporter.sendMail({
    from: SMTP_FROM,
    to: email,
    subject: 'Verify Your AUREON9 Email Address',
    html: `
      <h2>Email Verification</h2>
      <p>Welcome to AUREON9! Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}" style="display: inline-block; background-color: #0a2540; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Verify Email
      </a>
      <p>Or paste this link in your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
    `,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email, resetToken, userId) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&userId=${userId}`;
  
  return transporter.sendMail({
    from: SMTP_FROM,
    to: email,
    subject: 'Reset Your AUREON9 Password',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your AUREON9 account. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; background-color: #0a2540; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>Or paste this link in your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
}

/**
 * Send application status change notification
 */
export async function sendApplicationStatusEmail(email, applicationStatus, opportunityTitle) {
  return transporter.sendMail({
    from: SMTP_FROM,
    to: email,
    subject: `Application Status Update: ${applicationStatus}`,
    html: `
      <h2>Application Status Update</h2>
      <p>Your application for <strong>${opportunityTitle}</strong> has been updated.</p>
      <p><strong>Status:</strong> ${applicationStatus}</p>
      <p>Log in to your AUREON9 dashboard to view more details.</p>
    `,
  });
}

/**
 * Send tier upgrade notification
 */
export async function sendTierUpgradeNotification(email, memberName, newTier) {
  return transporter.sendMail({
    from: SMTP_FROM,
    to: email,
    subject: 'Congratulations! Your Tier Has Been Upgraded',
    html: `
      <h2>Tier Upgrade Notification</h2>
      <p>Congratulations, ${memberName}!</p>
      <p>Your membership tier has been upgraded to <strong>${newTier}</strong>.</p>
      <p>This upgrade unlocks new benefits and opportunities. Visit your dashboard to explore them!</p>
    `,
  });
}

/**
 * Send document review notification
 */
export async function sendDocumentReviewNotification(email, documentType, reviewStatus) {
  return transporter.sendMail({
    from: SMTP_FROM,
    to: email,
    subject: `Document Review Update: ${reviewStatus}`,
    html: `
      <h2>Document Review Update</h2>
      <p>Your <strong>${documentType}</strong> document has been reviewed.</p>
      <p><strong>Status:</strong> ${reviewStatus}</p>
      <p>Check your account for more details.</p>
    `,
  });
}

/**
 * Send registration confirmation
 */
export async function sendRegistrationConfirmation(email, memberName) {
  return transporter.sendMail({
    from: SMTP_FROM,
    to: email,
    subject: 'Welcome to AUREON9!',
    html: `
      <h2>Welcome to AUREON9, ${memberName}!</h2>
      <p>Your registration is complete. Start exploring the opportunities and rewards waiting for you.</p>
      <p>Our team will be in touch shortly to guide you through the next steps.</p>
    `,
  });
}

export default transporter;

const nodemailer = require("nodemailer");

// Lazy transporter — created on first use so env vars are guaranteed to be loaded
let _transporter = null;

const getTransporter = () => {
  if (!_transporter) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("EMAIL_USER or EMAIL_PASS is missing from .env");
      return null;
    }
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS.replace(/\s+/g, "")
      },
    });
    //console.log(`Email transporter created for: ${process.env.EMAIL_USER}`);
  }
  return _transporter;
};

/**
 * Send confirmation email to the applicant
 */
const sendApplicationConfirmation = async ({
  toEmail,
  applicantName,
  projectTitle,
  projectType,
  roleName,
  resumeUrl,
}) => {
  const typeLabel = {
    capstone: "Capstone Project",
    hackathon: "Hackathon",
    group: "Group Project",
    freelancing: "Freelancing Project",
  }[projectType] || projectType;

  const mailOptions = {
    from: `"ConnectSphere" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Application Submitted – ${projectTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:580px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
          
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:36px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">ConnectSphere</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Student Collaboration Platform</p>
          </div>

          <!-- Body -->
          <div style="padding:36px 32px;">
            <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;font-weight:700;">Dear ${applicantName},</h2>
            <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
              Your application has been successfully submitted. Here's a summary:
            </p>

            <!-- Details Card -->
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:8px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:130px;">Project</td>
                  <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:700;">${projectTitle}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Type</td>
                  <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:700;">${typeLabel}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Role Applied</td>
                  <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:700;">${roleName}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Status</td>
                  <td style="padding:8px 0;">
                    <span style="background:#fef9c3;color:#854d0e;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:700;">Pending Review</span>
                  </td>
                </tr>
                ${resumeUrl ? `
                <tr>
                  <td style="padding:8px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Resume</td>
                  <td style="padding:8px 0;">
                    <a href="${resumeUrl}" target="_blank" style="color:#2563eb;font-size:13px;font-weight:700;text-decoration:none;">📄 View Submitted Resume →</a>
                  </td>
                </tr>` : ''}
              </table>
            </div>

            <p style="margin:0 0 28px;color:#64748b;font-size:14px;line-height:1.7;">
              The project creator will review your application and get back to you. 
              You can track your application status anytime on the 
              <strong style="color:#2563eb;">My Applications</strong> page.
            </p>

            <div style="text-align:center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-applications" 
                 style="display:inline-block;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;text-decoration:none;padding:13px 32px;border-radius:50px;font-size:14px;font-weight:700;letter-spacing:0.3px;">
                View My Applications →
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">
              © 2026 ConnectSphere. All rights reserved.<br/>
              <span style="font-size:11px;">You received this email because you applied to a project on ConnectSphere.</span>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const transport = getTransporter();
    if (!transport) {
      console.error("Cannot send email — transporter not initialized (check EMAIL_USER/EMAIL_PASS in .env)");
      return;
    }
    await transport.sendMail(mailOptions);
   // console.log(`Confirmation email sent to ${toEmail}`);
  } 
  catch (err) {
    console.error("Error sending confirmation email:", err.message);
    console.error("Full error:", err);
  }
};

/**
 * Notify the creator when someone applies to their project
 */
const sendCreatorNotification = async ({
  toEmail,
  creatorName,
  applicantName,
  projectTitle,
  roleName,
}) => {
  const mailOptions = {
    from: `"ConnectSphere" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `New Application – ${projectTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:580px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
          
          <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:36px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">ConnectSphere</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Project Dashboard Alert</p>
          </div>

          <div style="padding:36px 32px;">
            <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;font-weight:700;">New application received, ${creatorName}.</h2>
            <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
              Someone just applied to your project. Review their profile and take action.
            </p>

            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:8px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;width:130px;">Project</td>
                  <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:700;">${projectTitle}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;">Applicant</td>
                  <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:700;">${applicantName}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;">Role</td>
                  <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:700;">${roleName}</td>
                </tr>
              </table>
            </div>

            <div style="text-align:center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin-dashboard"
                 style="display:inline-block;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;text-decoration:none;padding:13px 32px;border-radius:50px;font-size:14px;font-weight:700;">
                Review Applications →
              </a>
            </div>
          </div>

          <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">© 2026 ConnectSphere. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const transport = getTransporter();
    if (!transport) {
      console.error("Cannot send email,transporter not initialized");
      return;
    }
    await transport.sendMail(mailOptions);
   // console.log(`Creator notification sent to ${toEmail}`);
  } catch (err) {
    console.error("Error sending creator notification:", err.message);
    console.error("Full error:", err);
  }
};

/**
 * Send application status update email to the applicant (Accepted/Rejected)
 */
const sendApplicationStatusEmail = async ({
  toEmail,
  applicantName,
  projectTitle,
  roleName,
  status,
}) => {
  const isAccepted = status === "accepted";
  const subject = isAccepted
    ? `Application Accepted – ${projectTitle}`
    : `Application Update – ${projectTitle}`;
  const headerColor = isAccepted ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)";
  const statusColor = isAccepted ? "#10b981" : "#ef4444";
  
  const mailOptions = {
    from: `"ConnectSphere" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:580px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
          
          <div style="background:${headerColor};padding:36px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">ConnectSphere</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Application Status Update</p>
          </div>

          <div style="padding:36px 32px;">
            <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;font-weight:700;">Hi ${applicantName},</h2>
            <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
              ${isAccepted 
                ? `Great news! The project creator has <strong>accepted</strong> your application for <strong>${projectTitle}</strong>.` 
                : `Thank you for applying to <strong>${projectTitle}</strong>. Unfortunately, the creator has decided to move forward with other candidates for this specific role.`}
            </p>

            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:8px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;width:130px;">Project</td>
                  <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:700;">${projectTitle}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;">Role</td>
                  <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:700;">${roleName}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;">Status</td>
                  <td style="padding:8px 0;">
                     <span style="color:${statusColor};font-size:14px;font-weight:800;text-transform:capitalize;">${status}</span>
                  </td>
                </tr>
              </table>
            </div>

            ${isAccepted ? `
            <p style="margin:0 0 28px;color:#64748b;font-size:14px;line-height:1.7;">
              The project creator will be in touch with you shortly with the next steps. Congratulations on joining the team!
            </p>` : `
            <p style="margin:0 0 28px;color:#64748b;font-size:14px;line-height:1.7;">
              Don't be discouraged! There are many other amazing projects looking for talent like yours on ConnectSphere.
            </p>`}

            <div style="text-align:center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/explore"
                 style="display:inline-block;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;text-decoration:none;padding:13px 32px;border-radius:50px;font-size:14px;font-weight:700;">
                Explore More Projects →
              </a>
            </div>
          </div>

          <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">© 2026 ConnectSphere. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const transport = getTransporter();
    if (!transport) {
      console.error("Cannot send email — transporter not initialized");
      return;
    }
    await transport.sendMail(mailOptions);
    //console.log(`Application ${status} email sent to ${toEmail}`);
  } catch (err) {
    console.error("Error sending application status email:", err.message);
  }
};

/**
 * Send password reset OTP email
 */
const sendPasswordResetOTP = async ({ toEmail, name, otp }) => {
  const mailOptions = {
    from: `"ConnectSphere" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Reset Your Password – ConnectSphere`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:580px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
          <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:36px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">ConnectSphere</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Password Reset Request</p>
          </div>
          <div style="padding:36px 32px;">
            <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;font-weight:700;">Hi ${name},</h2>
            <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
              We received a request to reset your password. Use the OTP below to proceed. This OTP is valid for 10 minutes.
            </p>
            <div style="background:#f1f5f9;border-radius:12px;padding:32px;text-align:center;margin-bottom:24px;">
              <span style="font-family:monospace;font-size:36px;font-weight:800;letter-spacing:8px;color:#2563eb;">${otp}</span>
            </div>
            <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;text-align:center;">
              If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
          <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">© 2026 ConnectSphere. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const transport = getTransporter();
    if (!transport) return;
    await transport.sendMail(mailOptions);
  } catch (err) {
    console.error("Error sending OTP email:", err.message);
  }
};

/**
 * Send shortlist + assessment invite email to the applicant
 */
const sendShortlistEmail = async ({
  toEmail,
  applicantName,
  projectTitle,
  roleName,
  skillMatch,
  assessmentToken,
}) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const assessmentLink = `${frontendUrl}/assessment?token=${assessmentToken}`;

  const mailOptions = {
    from: `"ConnectSphere" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `You're Shortlisted: Online Assessment – ${projectTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#f0f4ff;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(37,99,235,0.13);">

          <!-- Header -->
          <div style="background:linear-gradient(135deg,#2563eb 0%,#7c3aed 60%,#a21caf 100%);padding:44px 36px 36px;text-align:center;position:relative;">
            <div style="display:inline-block;background:rgba(255,255,255,0.18);border-radius:50%;width:64px;height:64px;line-height:64px;margin-bottom:16px;">
              <span style="font-size:32px;font-family:serif;color:#ffffff;font-weight:bold;">S</span>
            </div>
            <h1 style="margin:0 0 6px;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">Assessment Invitation</h1>
            <p style="margin:0;color:rgba(255,255,255,0.85);font-size:15px;">ConnectSphere Online Assessment Invitation</p>
          </div>

          <!-- Body -->
          <div style="padding:36px;">
            <h2 style="margin:0 0 10px;color:#0f172a;font-size:20px;font-weight:700;">Dear ${applicantName},</h2>
            <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7;">
              Congratulations! Based on your impressive profile, the project creator has <strong style="color:#2563eb;">accepted your application</strong> and shortlisted you for an <strong>Online Assessment</strong>.
            </p>

            <!-- Project Details Card -->
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:20px 24px;margin-bottom:28px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:9px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;width:120px;">Project</td>
                  <td style="padding:9px 0;color:#0f172a;font-size:14px;font-weight:700;">${projectTitle}</td>
                </tr>
                <tr>
                  <td style="padding:9px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;">Role</td>
                  <td style="padding:9px 0;color:#0f172a;font-size:14px;font-weight:700;">${roleName}</td>
                </tr>
                <tr>
                  <td style="padding:9px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;">Duration</td>
                  <td style="padding:9px 0;color:#0f172a;font-size:14px;font-weight:700;">15 Minutes</td>
                </tr>
                <tr>
                  <td style="padding:9px 0;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;">Format</td>
                  <td style="padding:9px 0;color:#0f172a;font-size:14px;font-weight:700;">30 Multiple Choice Questions</td>
                </tr>
              </table>
            </div>

            <!-- Steps -->
            <p style="margin:0 0 14px;color:#0f172a;font-size:14px;font-weight:700;">How to take the assessment:</p>
            <div style="margin-bottom:28px;">
              ${["Click the button below to open the Assessment Portal", "Log in with your ConnectSphere credentials", "Start the 15-minute timed test", "Submit before the timer ends."].map((s, i) => `
              <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:12px;">
                <div style="min-width:28px;height:28px;background:linear-gradient(135deg,#2563eb,#7c3aed);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800;flex-shrink:0;">${i + 1}</div>
                <p style="margin:4px 0 0;color:#475569;font-size:14px;line-height:1.5;">${s}</p>
              </div>`).join("")}
            </div>

            <!-- CTA Button -->
            <div style="text-align:center;margin-bottom:8px;">
              <a href="${assessmentLink}"
                 style="display:inline-block;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;text-decoration:none;padding:16px 44px;border-radius:50px;font-size:16px;font-weight:800;letter-spacing:0.3px;box-shadow:0 4px 20px rgba(37,99,235,0.35);">
                Start Assessment →
              </a>
            </div>
            <p style="text-align:center;margin:12px 0 0;color:#94a3b8;font-size:12px;">This link is unique to you. Do not share it with others.</p>
          </div>

          <!-- Footer -->
          <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 36px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">
              © 2026 ConnectSphere. All rights reserved.<br/>
              <span style="font-size:11px;">You received this because your application was shortlisted.</span>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const transport = getTransporter();
    if (!transport) {
      console.error("Cannot send shortlist email — transporter not initialized");
      return;
    }
    await transport.sendMail(mailOptions);
  } catch (err) {
    console.error("Error sending shortlist email:", err.message);
  }
};

/**
 * Send interview invitation email after passing the assessment
 */
const sendInterviewEmail = async ({
  toEmail,
  applicantName,
  projectTitle,
  roleName
}) => {
  const mailOptions = {
    from: `"ConnectSphere" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Invitation to Final Interview – ${projectTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:580px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
          <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:36px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">ConnectSphere</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Next Steps: Final Interview</p>
          </div>
          <div style="padding:36px 32px;">
            <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;font-weight:700;">Congratulations, ${applicantName}.</h2>
            <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
              You have successfully passed the online assessment for the <strong>${roleName}</strong> role on <strong>${projectTitle}</strong>! The project creator reviewed your outstanding results and would love to move forward with a final round online interview.
            </p>
            <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
              Please join using this demo interview link at the scheduled time:<br/><br/>
              <a href="https://meet.google.com/demo-interview-link" style="color:#2563eb;font-weight:700;">https://meet.google.com/demo-interview-link</a>
            </p>
            <div style="text-align:center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-applications"
                 style="display:inline-block;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;text-decoration:none;padding:13px 32px;border-radius:50px;font-size:14px;font-weight:700;">
                Go to Dashboard →
              </a>
            </div>
          </div>
          <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">© 2026 ConnectSphere. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const transport = getTransporter();
    if (!transport) return;
    await transport.sendMail(mailOptions);
  } catch (err) {
    console.error("Error sending interview email:", err.message);
  }
};

/**
 * Send selection confirmation email
 */
const sendSelectionEmail = async ({
  toEmail,
  applicantName,
  projectTitle,
  roleName
}) => {
  const mailOptions = {
    from: `"ConnectSphere" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `You're Selected! – ${projectTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:580px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
          <div style="background:linear-gradient(135deg,#059669,#10b981);padding:36px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;">ConnectSphere</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Final Selection Update</p>
          </div>
          <div style="padding:36px 32px;">
            <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;font-weight:700;">Congratulations, ${applicantName}!</h2>
            <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
              After a rigorous selection process, the project creator has officially <strong>Selected</strong> you for the <strong>${roleName}</strong> role on the project <strong>${projectTitle}</strong>. Your performance was excellent!
            </p>
            <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
              Expect further communications regarding onboarding directly from the project team.
            </p>
            <div style="text-align:center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-applications"
                 style="display:inline-block;background:linear-gradient(135deg,#059669,#10b981);color:#fff;text-decoration:none;padding:13px 32px;border-radius:50px;font-size:14px;font-weight:700;">
                Go to Dashboard →
              </a>
            </div>
          </div>
          <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">© 2026 ConnectSphere. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const transport = getTransporter();
    if (!transport) return;
    await transport.sendMail(mailOptions);
  } catch (err) {
    console.error("Error sending selection email:", err.message);
  }
};

module.exports = {
  sendApplicationConfirmation,
  sendCreatorNotification,
  sendApplicationStatusEmail,
  sendPasswordResetOTP,
  sendShortlistEmail,
  sendInterviewEmail,
  sendSelectionEmail,
};

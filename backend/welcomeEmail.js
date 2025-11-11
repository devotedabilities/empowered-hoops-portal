// welcomeEmail.js
// Email notification service for new coach invitations

const nodemailer = require('nodemailer');

/**
 * Send welcome email when a new coach is added to the portal
 * @param {string} coachEmail - The coach's email address
 * @param {string} coachName - The coach's name
 * @param {string} role - The user's role (admin or coach)
 */
async function sendWelcomeEmail(coachEmail, coachName, role = 'coach') {
  try {
    // Create transporter using Gmail SMTP (same as tracker emails)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const portalUrl = 'https://app.empoweredhoops.com.au';
    const displayName = coachName || coachEmail.split('@')[0];
    const roleText = role === 'admin' ? 'Administrator' : 'Coach';

    // Email content
    const emailContent = `
Hi ${displayName},

Welcome to the Empowered Hoops Coach Portal!

You've been granted ${roleText} access to our coaching platform.

🏀 Portal URL: ${portalUrl}

To log in:
1. Visit ${portalUrl}
2. Click "Sign in with Google"
3. Use this email address: ${coachEmail}

${role === 'coach' ? `
As a coach, you can:
- Create and manage your term trackers
- Mark participant attendance
- Access coaching resources
- View your program schedules
` : `
As an administrator, you can:
- View and manage all term trackers
- Add and manage coach accounts
- Access all coaching resources
- Monitor program activities
`}

If you have any questions or need assistance, please contact david@devotedabilities.com

Welcome to the team!

Best regards,
Empowered Hoops Team
    `.trim();

    // Email options
    const mailOptions = {
      from: `"Empowered Hoops Coach Portal" <${process.env.EMAIL_USER}>`,
      to: coachEmail,
      cc: 'david@devotedabilities.com, info@empoweredhoops.com.au', // Notify admins
      subject: `Welcome to Empowered Hoops Coach Portal!`,
      text: emailContent,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff6b35 0%, #ff5522 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏀 Welcome to Empowered Hoops!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi ${displayName},</p>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Welcome to the <strong>Empowered Hoops Coach Portal</strong>! You've been granted <strong>${roleText}</strong> access to our coaching platform.
            </p>
            
            <div style="background: white; padding: 25px; border-radius: 8px; border: 2px solid #ff6b35; margin: 30px 0; text-align: center;">
              <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px; font-weight: 600;">YOUR PORTAL ACCESS</p>
              <p style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px;">
                <strong>Email:</strong> ${coachEmail}
              </p>
              <p style="margin: 0; color: #1f2937; font-size: 16px;">
                <strong>Role:</strong> ${roleText}
              </p>
            </div>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <p style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px; font-weight: 600;">📋 How to Log In:</p>
              <ol style="margin: 0; padding-left: 20px; color: #4b5563;">
                <li style="margin-bottom: 8px;">Visit <a href="${portalUrl}" style="color: #ff6b35; text-decoration: none; font-weight: 600;">${portalUrl}</a></li>
                <li style="margin-bottom: 8px;">Click "Sign in with Google"</li>
                <li>Use your email: <strong>${coachEmail}</strong></li>
              </ol>
            </div>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
              <p style="margin: 0 0 10px 0; color: #92400e; font-size: 16px; font-weight: 600;">
                ${role === 'coach' ? '🎯 What You Can Do:' : '⚡ Your Admin Powers:'}
              </p>
              <ul style="margin: 0; padding-left: 20px; color: #78350f;">
                ${role === 'coach' ? `
                  <li style="margin-bottom: 5px;">Create and manage your term trackers</li>
                  <li style="margin-bottom: 5px;">Mark participant attendance</li>
                  <li style="margin-bottom: 5px;">Access coaching resources</li>
                  <li>View your program schedules</li>
                ` : `
                  <li style="margin-bottom: 5px;">View and manage all term trackers</li>
                  <li style="margin-bottom: 5px;">Add and manage coach accounts</li>
                  <li style="margin-bottom: 5px;">Access all coaching resources</li>
                  <li>Monitor all program activities</li>
                `}
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${portalUrl}" 
                 style="background: linear-gradient(135deg, #ff6b35 0%, #ff5522 100%); 
                        color: white; 
                        padding: 15px 40px; 
                        text-decoration: none; 
                        border-radius: 6px; 
                        font-weight: 600;
                        font-size: 16px;
                        display: inline-block;">
                🚀 Access Portal Now
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              Need help? Contact <a href="mailto:david@devotedabilities.com" style="color: #ff6b35; text-decoration: none;">david@devotedabilities.com</a>
            </p>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 20px; text-align: center;">
              Welcome to the team!<br>
              <strong>Empowered Hoops</strong>
            </p>
          </div>
        </div>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Welcome email sent successfully to:', coachEmail, '| MessageId:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendWelcomeEmail,
};
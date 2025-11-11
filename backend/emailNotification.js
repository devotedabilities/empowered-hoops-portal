// emailNotification.js
// Email notification service for term tracker creation

const nodemailer = require('nodemailer');

/**
 * Send email notification when a new term tracker is created
 * @param {Object} termConfig - The term configuration details
 * @param {string} sheetId - The Google Sheets ID
 * @param {string} sheetUrl - The Google Sheets URL
 */
async function sendTermTrackerNotification(termConfig, sheetId, sheetUrl) {
  try {
    // Create transporter using Gmail SMTP
    // You can also use other email services like SendGrid, Mailgun, etc.
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_APP_PASSWORD, // Gmail App Password (not regular password)
      },
    });

    // Email content
    const emailContent = `
Hi David,

A new term tracker has been created:

Program: ${termConfig.programType}
Term: ${termConfig.termName} ${termConfig.year}
Coach: ${termConfig.coachName}
Session: ${termConfig.sessionDay}s at ${termConfig.sessionTime}
Start Date: ${termConfig.startDate}
Number of Sessions: ${termConfig.numberOfSessions}

Sheet ID: ${sheetId}
Sheet URL: ${sheetUrl}

Best regards,
Empowered Hoops Term Tracker System
    `.trim();

    // Email options
    const mailOptions = {
      from: `"Empowered Hoops Term Tracker" <${process.env.EMAIL_USER}>`,
      to: 'david@devotedabilities.com, info@empoweredhoops.com.au',
      subject: `New Term Tracker Created - ${termConfig.programType} - ${termConfig.termName} ${termConfig.year}`,
      text: emailContent,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏀 New Term Tracker Created</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi David,</p>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              A new term tracker has been created:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600; width: 40%;">Program:</td>
                  <td style="padding: 10px 0; color: #1f2937; font-weight: 600;">${termConfig.programType}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Term:</td>
                  <td style="padding: 10px 0; color: #1f2937; font-weight: 600;">${termConfig.termName} ${termConfig.year}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Coach:</td>
                  <td style="padding: 10px 0; color: #1f2937;">${termConfig.coachName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Session:</td>
                  <td style="padding: 10px 0; color: #1f2937;">${termConfig.sessionDay}s at ${termConfig.sessionTime}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Start Date:</td>
                  <td style="padding: 10px 0; color: #1f2937;">${termConfig.startDate}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Sessions:</td>
                  <td style="padding: 10px 0; color: #1f2937;">${termConfig.numberOfSessions} weeks</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; border-left: 4px solid #8b5cf6; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; font-weight: 600;">SHEET DETAILS:</p>
              <p style="margin: 0 0 5px 0; color: #1f2937; font-size: 14px;">
                <strong>Sheet ID:</strong> ${sheetId}
              </p>
              <p style="margin: 0; color: #1f2937; font-size: 14px;">
                <strong>Sheet URL:</strong> <a href="${sheetUrl}" style="color: #8b5cf6; text-decoration: none;">${sheetUrl}</a>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${sheetUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 6px; 
                        font-weight: 600;
                        display: inline-block;">
                📊 Open Spreadsheet
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              Best regards,<br>
              <strong>Empowered Hoops Term Tracker System</strong>
            </p>
          </div>
        </div>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email notification sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Error sending email notification:', error);
    // Don't throw error - we don't want email failure to break the tracker creation
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendTermTrackerNotification,
};

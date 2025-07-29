// services/emailService.js
const nodemailer = require('nodemailer');

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to your email provider
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS  // Your app password (not regular password)
    }
  });
};

// Alternative configuration for other email providers
// const createTransporter = () => {
//   return nodemailer.createTransporter({
//     host: 'smtp.your-email-provider.com',
//     port: 587,
//     secure: false,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS
//     }
//   });
// };

const sendOTPEmail = async (email, otp, userName = 'User') => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"AUTOSUME Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset - Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - AUTOSUME</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 30px;
              border-bottom: 2px solid #667eea;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #667eea;
              margin-bottom: 10px;
            }
            .otp-code {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              font-size: 32px;
              font-weight: bold;
              text-align: center;
              padding: 20px;
              border-radius: 8px;
              letter-spacing: 8px;
              margin: 30px 0;
              font-family: monospace;
            }
            .warning {
              background-color: #fff3cd;
              color: #856404;
              padding: 15px;
              border-radius: 5px;
              border-left: 4px solid #ffc107;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">AUTOSUME</div>
              <h2 style="color: #333; margin: 0;">Password Reset Request</h2>
            </div>
            
            <p>Hello ${userName},</p>
            
            <p>We received a request to reset your password for your AUTOSUME account. To proceed with the password reset, please use the verification code below:</p>
            
            <div class="otp-code">${otp}</div>
            
            <p style="text-align: center; color: #666;">
              <strong>This code will expire in 10 minutes.</strong>
            </p>
            
            <div class="warning">
              <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email and your password will remain unchanged. For your security, do not share this code with anyone.
            </div>
            
            <p>If you're having trouble with the password reset process, feel free to contact our support team.</p>
            
            <div class="footer">
              <p>Best regards,<br>The AUTOSUME Team</p>
              <p style="font-size: 12px; color: #999;">
                This email was sent to ${email}. If you didn't expect this email, you can safely ignore it.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOTPEmail
};
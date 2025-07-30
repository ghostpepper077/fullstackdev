const { OpenAI } = require("openai");
const sendgrid = require('@sendgrid/mail');
require('dotenv').config();

// Set up OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Replace with your OpenAI API key
});

// Set up SendGrid API client
sendgrid.setApiKey(process.env.SENDGRID_API_KEY); // Replace with your SendGrid API key

// Function to generate email content using OpenAI
const generateEmailContent = async (recipientName, otp) => {
  try {
    const prompt = `
      Generate a professional and secure password reset email. The email should include the following:
      - Personalized greeting using the recipient's name: ${recipientName}.
      - OTP: ${otp}.
      - Mention that the OTP expires in 10 minutes.
      - A security warning in case the recipient didn't request a reset.
      - Use HTML formatting with bold and clearly visible OTP.

      Email should be clear, friendly, and professional.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4", // You can change this to `gpt-3.5` for faster results
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating email content:", error);
    return null;
  }
};

// Function to send email using SendGrid
// Function to send email using SendGrid
const sendEmail = async (email, recipientName, otp) => {
  try {
    const emailBody = await generateEmailContent(recipientName, otp);

    if (!emailBody) {
      console.log("Failed to generate email content");
      return { success: false, error: "Failed to generate email content" };
    }

    const msg = {
      to: email,
      from: 'contact.autosume@gmail.com',
      subject: 'Password Reset - Verification Code',
      html: emailBody,
    };

    // Send email via SendGrid API
    const result = await sendgrid.send(msg);
    console.log('Email sent successfully:', result);
    
    // Return a consistent format
    return { 
      success: true, 
      statusCode: result[0].statusCode,
      response: result 
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error.message,
      response: null 
    };
  }
};

// Expose sendEmail function to be used in routes or controllers
module.exports = {
  sendEmail,
};
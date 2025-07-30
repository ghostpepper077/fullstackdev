const { OpenAI } = require("openai");
const sendgrid = require("@sendgrid/mail");
require("dotenv").config();

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
    Generate a well-structured, professional HTML email for a password reset request using the following data:

    - Recipient name: ${recipientName}
    - One-time password (OTP): ${otp}
    - OTP expires in 10 minutes

    The email should:
    - Greet the user by name
    - Explain the purpose of the email
    - Display the OTP in a large, bold, centered box
    - Warn users who didn't request the reset
    - End with a courteous sign-off from the Autosume Team
    - Match the following visual style:

      • Max-width 600px
      • Padded container with light background and subtle box-shadow
      • Font: Arial, clean spacing, soft rounded corners
      • Clear heading, center-aligned OTP
      • Neutral, friendly tone

    Return only valid HTML with inline styles—no markdown, no explanations.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating email content:", error);
    return null;
  }
};

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
      from: "contact.autosume@gmail.com",
      subject: "Password Reset - Verification Code",
      html: emailBody,
    };

    // Send email via SendGrid API
    const result = await sendgrid.send(msg);
    console.log("Email sent successfully:", result);

    // Return a consistent format
    return {
      success: true,
      statusCode: result[0].statusCode,
      response: result,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error.message,
      response: null,
    };
  }
};

// Expose sendEmail function to be used in routes or controllers
module.exports = {
  sendEmail,
};

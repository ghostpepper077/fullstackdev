import axios from 'axios';

export async function getChatbotResponse(userInput) {
  try {
    const res = await axios.post('http://localhost:5000/api/chatbot/chat', {
      message: userInput,
    });
    return res.data.reply;
  } catch (error) {
    console.error('Chatbot API error:', error);
    return "Sorry, I'm having trouble reaching the server. Please try again later.";
  }
}

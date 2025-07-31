// src/ChatbotService.jsx
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/chatbot';

export async function getChatbotResponse(userInput, sessionId) {
  try {
    const res = await axios.post(`${API_BASE}/chat`, {
      message: userInput,
      sessionId,
    });
    return res.data.reply;
  } catch (error) {
    console.error('Chatbot API error:', error);
    return "Sorry, I'm having trouble reaching the server. Please try again later.";
  }
}

export async function fetchChatHistory(sessionId) {
  try {
    const res = await axios.get(`${API_BASE}/history/${sessionId}`);
    return res.data.messages;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}

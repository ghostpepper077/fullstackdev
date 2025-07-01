// /src/features/Chatbot/components/ChatWindow.js
import { useState } from "react";
import { getChatbotResponse } from "../pages/Chatbot/ChatbotService";
import MessageBubble from "./MessageBubble";

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I’m your HR Assistant. Ask me anything about the staff handbook." },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    const botReply = { sender: "bot", text: getChatbotResponse(input) };

    setMessages((prev) => [...prev, userMsg, botReply]);
    setInput("");
  };

  return (
    <div style={{ padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <div style={{ height: 300, overflowY: "auto", marginBottom: 10 }}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} sender={msg.sender} text={msg.text} />
        ))}
      </div>
      <div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          style={{ width: "70%", padding: 8 }}
        />
        <button onClick={handleSend} style={{ padding: 8, marginLeft: 10 }}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;

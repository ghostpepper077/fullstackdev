// /src/features/Chatbot/components/MessageBubble.js
const MessageBubble = ({ sender, text }) => {
  const isUser = sender === "user";
  return (
    <div style={{ textAlign: isUser ? "right" : "left", marginBottom: 10 }}>
      <div
        style={{
          display: "inline-block",
          background: isUser ? "#1976d2" : "#eee",
          color: isUser ? "#fff" : "#000",
          padding: 10,
          borderRadius: 10,
          maxWidth: "70%",
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default MessageBubble;

// /src/features/Chatbot/ChatbotPage.js
import ChatWindow from "../../components/ChatWindow";
import MessageBubble from "../../components/MessageBubble";

const ChatbotPage = () => {
  return (
    <div style={{ padding: 20 }}>
      <PageTitle title="Staff Handbook Assistant" />
      <ChatWindow />
    </div>
  );
};

export default ChatbotPage;

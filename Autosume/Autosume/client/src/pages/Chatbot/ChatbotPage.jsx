import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as BotIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getChatbotResponse, fetchChatHistory } from './ChatbotService';
import { v4 as uuidv4 } from 'uuid';

const PageTitle = ({ title }) => (
  <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
    {title}
  </Typography>
);

const MessageBubble = ({ message, isUser }) => (
  <ListItem
    sx={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      px: 0,
      py: 1,
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: isUser ? 'row-reverse' : 'row',
        maxWidth: '70%',
      }}
    >
      <Box
        sx={{
          minWidth: 32,
          height: 32,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: isUser ? 'primary.main' : 'grey.300',
          color: isUser ? 'white' : 'text.primary',
          mx: 1,
        }}
      >
        {isUser ? <PersonIcon fontSize="small" /> : <BotIcon fontSize="small" />}
      </Box>
      <Paper
        sx={{
          p: 2,
          bgcolor: isUser ? 'primary.main' : 'grey.100',
          color: isUser ? 'white' : 'text.primary',
          borderRadius: 2,
          maxWidth: '100%',
        }}
      >
        <Typography variant="body1">{message}</Typography>
      </Paper>
    </Box>
  </ListItem>
);

const ChatWindow = ({ messages, onSendMessage }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <Paper sx={{ height: 500, display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
          '&::-webkit-scrollbar-thumb': { background: '#888', borderRadius: '3px' },
        }}
      >
        <List sx={{ py: 0 }}>
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message.text} isUser={message.isUser} />
          ))}
        </List>
      </Box>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask me about company policies..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
        />
        <IconButton color="primary" onClick={handleSend} disabled={!input.trim()}>
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

const ChatbotPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  const loadChatMessages = async (chat) => {
    const messages = await fetchChatHistory(chat.sessionId);
    return { ...chat, messages };
  };

  useEffect(() => {
    const storedChats = JSON.parse(localStorage.getItem('chatbot_sessions')) || [];
    Promise.all(storedChats.map(loadChatMessages)).then((loadedChats) => {
      setChats(loadedChats);
      if (loadedChats.length > 0) setSelectedChatId(loadedChats[0].id);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('chatbot_sessions', JSON.stringify(chats.map(({ messages, ...rest }) => rest)));
  }, [chats]);

  const handleCreateNewChat = async () => {
    const id = Date.now();
    const sessionId = uuidv4();
    const newChat = {
      id,
      title: `Chat ${chats.length + 1}`,
      sessionId,
      messages: [
        {
          text: "Hello! I'm your Staff Handbook Assistant. Ask me anything about company policies!",
          isUser: false,
        },
      ],
    };
    setChats((prev) => [...prev, newChat]);
    setSelectedChatId(id);
  };

  const handleSendMessage = async (text) => {
    const chatIndex = chats.findIndex((c) => c.id === selectedChatId);
    if (chatIndex === -1) return;

    const updatedChats = [...chats];
    const chat = updatedChats[chatIndex];

    chat.messages.push({ text, isUser: true });
    chat.messages.push({ text: 'Typing...', isUser: false });
    setChats(updatedChats);

    const reply = await getChatbotResponse(text, chat.sessionId);

    chat.messages.pop(); // remove 'Typing...'
    chat.messages.push({ text: reply, isUser: false });

    setChats([...updatedChats]);
  };

  const handleDeleteChat = (id) => {
    const updated = chats.filter((c) => c.id !== id);
    setChats(updated);
    if (selectedChatId === id) {
      setSelectedChatId(updated[0]?.id || null);
    }
  };

  const selectedChat = chats.find((c) => c.id === selectedChatId);

  return (
    <Box sx={{ display: 'flex', height: '100%', p: 3 }}>
      <Box sx={{ width: 250, pr: 2 }}>
        <PageTitle title="Chats" />
        <Button variant="contained" fullWidth onClick={handleCreateNewChat} sx={{ mb: 2 }}>
          + New Chat
        </Button>
        <List>
          {chats.map((chat) => (
            <ListItem
              key={chat.id}
              selected={chat.id === selectedChatId}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: chat.id === selectedChatId ? 'action.selected' : 'transparent',
                borderRadius: 1,
                px: 1,
                py: 0.5,
                mb: 1,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Box onClick={() => setSelectedChatId(chat.id)} sx={{ flexGrow: 1 }}>
                <Typography variant="body1">{chat.title}</Typography>
              </Box>
              <IconButton size="small" edge="end" color="error" onClick={() => handleDeleteChat(chat.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ flex: 1 }}>
        <PageTitle title="Staff Handbook Assistant" />
        {selectedChat ? (
          <ChatWindow messages={selectedChat.messages} onSendMessage={handleSendMessage} />
        ) : (
          <Typography variant="body1">Select or create a chat to begin.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default ChatbotPage;


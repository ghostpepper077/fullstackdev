// src/pages/Chatbot/ChatbotPage.jsx (or src/features/Chatbot/ChatbotPage.jsx)
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  List, 
  ListItem,
  Divider,
  IconButton
} from '@mui/material';
import { Send as SendIcon, Psychology as BotIcon, Person as PersonIcon } from '@mui/icons-material';
import { getChatbotResponse } from './chatbotService';

// PageTitle Component (inline)
const PageTitle = ({ title }) => (
  <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
    {title}
  </Typography>
);

// MessageBubble Component (inline)
const MessageBubble = ({ message, isUser }) => (
  <ListItem sx={{ 
    display: 'flex', 
    justifyContent: isUser ? 'flex-end' : 'flex-start',
    px: 0,
    py: 1
  }}>
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'flex-start',
      flexDirection: isUser ? 'row-reverse' : 'row',
      maxWidth: '70%'
    }}>
      <Box sx={{ 
        minWidth: 32, 
        height: 32, 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: isUser ? 'primary.main' : 'grey.300',
        color: isUser ? 'white' : 'text.primary',
        mx: 1
      }}>
        {isUser ? <PersonIcon fontSize="small" /> : <BotIcon fontSize="small" />}
      </Box>
      <Paper sx={{ 
        p: 2, 
        bgcolor: isUser ? 'primary.main' : 'grey.100',
        color: isUser ? 'white' : 'text.primary',
        borderRadius: 2,
        maxWidth: '100%'
      }}>
        <Typography variant="body1">{message}</Typography>
      </Paper>
    </Box>
  </ListItem>
);

// ChatWindow Component (inline)
const ChatWindow = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your Staff Handbook Assistant. Ask me anything about company policies!", isUser: false }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      // Add user message
      const userMessage = { text: input, isUser: true };
      setMessages(prev => [...prev, userMessage]);
      
      // Get bot response
      const botResponse = getChatbotResponse(input);
      const botMessage = { text: botResponse, isUser: false };
      
      // Add bot response after a short delay
      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
      }, 500);
      
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <Paper sx={{ height: 500, display: 'flex', flexDirection: 'column' }}>
      {/* Chat Messages */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2,
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '3px',
        },
      }}>
        <List sx={{ py: 0 }}>
          {messages.map((message, index) => (
            <MessageBubble 
              key={index} 
              message={message.text} 
              isUser={message.isUser} 
            />
          ))}
        </List>
      </Box>
      
      <Divider />
      
      {/* Input Area */}
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
        <IconButton 
          color="primary" 
          onClick={handleSend}
          disabled={!input.trim()}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

const ChatbotPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <PageTitle title="Staff Handbook Assistant" />
      <ChatWindow />
    </Box>
  );
};

export default ChatbotPage;
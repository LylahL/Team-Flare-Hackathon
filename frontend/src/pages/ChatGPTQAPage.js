import React, { useState, useRef } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  CircularProgress,
  Divider
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import axios from 'axios';

const ChatGPTQAPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chatgpt', { 
        message: inputText 
      });

      const chatGPTResponse = {
        id: messages.length + 2,
        text: response.data.answer,
        sender: 'chatGPT',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, chatGPTResponse]);
    } catch (error) {
      console.error('Error fetching response from ChatGPT API:', error);
      
      const errorMessage = {
        id: messages.length + 2,
        text: 'Sorry, an error occurred while processing your request.',
        sender: 'system',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ 
      height: 'calc(100vh - 64px)', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: '#f5f5f5',
      pt: 2
    }}>
      <Container maxWidth="md" sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            ChatGPT Q&A
          </Typography>
          <Typography variant="body1">
            Ask any immigration-related questions and get instant answers from our AI assistant.
          </Typography>
        </Paper>

        <List sx={{ mb: 2 }}>
          {messages.map((message) => (
            <Box key={message.id} sx={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              mb: 2
            }}>
              {message.sender === 'chatGPT' && (
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: '#1976d2' }}>AI</Avatar>
                </ListItemAvatar>
              )}
              
              <ListItem 
                sx={{
                  maxWidth: '70%',
                  bgcolor: message.sender === 'user' ? '#1976d2' : '#ffffff',
                  borderRadius: 2,
                  boxShadow: 1
                }}
              >
                <ListItemText 
                  primary={message.text} 
                  secondary={message.timestamp}
                  sx={{
                    color: message.sender === 'user' ? '#ffffff' : '#000000',
                    wordBreak: 'break-word'
                  }}
                />
              </ListItem>
            </Box>
          ))}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </List>
      </Container>

      <Box sx={{ 
        p: 2, 
        backgroundColor: '#ffffff', 
        borderTop: '1px solid #e0e0e0'
      }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ask a question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <IconButton 
              color="primary" 
              onClick={handleSendMessage}
              disabled={isLoading}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default ChatGPTQAPage;


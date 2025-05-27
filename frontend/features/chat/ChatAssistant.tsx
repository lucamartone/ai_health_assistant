import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

const ChatAssistant = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<string[]>([]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setChatHistory([...chatHistory, message]);
      setMessage('');
      // TODO: Implementare la logica per inviare il messaggio all'assistente
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: '600px', margin: '0 auto' }}>
      <Typography variant="h5" align="center" gutterBottom>
        Assistente Sanitario
      </Typography>
      <Paper sx={{ p: 2, mt: 2, maxHeight: '300px', overflow: 'auto', backgroundColor: '#f5f5f5' }}>
        {chatHistory.map((msg, index) => (
          <Box key={index} sx={{ mb: 1, p: 1, backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
            <Typography>{msg}</Typography>
          </Box>
        ))}
      </Paper>
      <Box sx={{ display: 'flex', mt: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Scrivi un messaggio..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button variant="contained" onClick={handleSendMessage} sx={{ ml: 1 }}>
          Invia
        </Button>
      </Box>
    </Box>
  );
};

export default ChatAssistant; 
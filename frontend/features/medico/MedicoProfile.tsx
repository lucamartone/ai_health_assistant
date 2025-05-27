import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

const MedicoProfile = () => {
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implementare la logica per salvare il profilo del medico
    console.log('Medico Profile:', { name, specialization, location });
  };

  return (
    <Box sx={{ p: 2, maxWidth: '600px', margin: '0 auto' }}>
      <Typography variant="h5" align="center" gutterBottom>
        Profilo Medico
      </Typography>
      <Paper sx={{ p: 2, mt: 2, backgroundColor: '#f5f5f5' }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Nome"
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="specialization"
            label="Specializzazione"
            name="specialization"
            autoComplete="specialization"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="location"
            label="Località"
            name="location"
            autoComplete="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Salva Profilo
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default MedicoProfile; 
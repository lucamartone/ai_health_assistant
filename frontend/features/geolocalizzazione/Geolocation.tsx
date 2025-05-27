import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';

const Geolocation = () => {
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setError(error.message);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">Geolocalizzazione</Typography>
      {position ? (
        <Typography>
          Posizione corrente: {position.latitude}, {position.longitude}
        </Typography>
      ) : (
        <Typography>Caricamento posizione...</Typography>
      )}
      {error && <Typography color="error">{error}</Typography>}
      <Button variant="contained" sx={{ mt: 2 }}>
        Trova specialisti vicini
      </Button>
    </Box>
  );
};

export default Geolocation; 
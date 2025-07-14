import React from 'react';
import { useLocation } from "react-router-dom";
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { Home as HomeIcon, Error as ErrorIcon } from '@mui/icons-material';
import { logger } from '../utils/logging';

const NotFound = () => {
  const location = useLocation();

  React.useEffect(() => {
    logger.error('NotFound', 'User attempted to access non-existent route', { path: location.pathname });
  }, [location.pathname]);

  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Card sx={{ maxWidth: 600, width: '100%' }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <ErrorIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h3" gutterBottom color="error" fontWeight="bold">
            404
          </Typography>
          <Typography variant="h5" gutterBottom>
            Page Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            The page you're looking for doesn't exist or has been moved.
          </Typography>
          <Button 
            variant="contained" 
            href="/" 
            size="large"
            startIcon={<HomeIcon />}
            sx={{ mt: 2 }}
          >
            Return to URL Shortener
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NotFound;

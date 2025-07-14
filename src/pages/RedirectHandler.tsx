import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
} from '@mui/material';
import { 
  Link as LinkIcon, 
  Schedule as ScheduleIcon,
  Error as ErrorIcon 
} from '@mui/icons-material';

import { logger } from '../utils/logging';
import { urlService } from '../services/urlService';
import { ShortenedUrl } from '../types';

const RedirectHandler: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [url, setUrl] = useState<ShortenedUrl | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!shortCode) {
      setError('Invalid short code');
      setLoading(false);
      return;
    }

    logger.info('RedirectHandler', 'Processing redirect request', { shortCode });

    // Look up the URL
    const foundUrl = urlService.getUrlByShortCode(shortCode);
    
    if (!foundUrl) {
      setError('Short URL not found or has expired');
      setLoading(false);
      logger.warn('RedirectHandler', 'URL not found', { shortCode });
      return;
    }

    setUrl(foundUrl);
    setLoading(false);

    // Record the click
    urlService.recordClick(shortCode, 'direct');

    // Start countdown for redirect
    setRedirecting(true);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          performRedirect(foundUrl.originalUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [shortCode]);

  const performRedirect = (targetUrl: string) => {
    logger.info('RedirectHandler', 'Redirecting to original URL', { 
      shortCode, 
      targetUrl,
      delay: '5 seconds'
    });
    
    window.location.href = targetUrl;
  };

  const handleManualRedirect = () => {
    if (url) {
      performRedirect(url.originalUrl);
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          minHeight: '80vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">
            Looking up short URL...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          minHeight: '80vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <Card sx={{ maxWidth: 600, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <ErrorIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h4" gutterBottom color="error">
              URL Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {error}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              The short URL <strong>/{shortCode}</strong> either doesn't exist or has expired.
            </Typography>
            <Button 
              variant="contained" 
              href="/" 
              size="large"
              sx={{ mt: 2 }}
            >
              Create New Short URL
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '80vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}
    >
      <Card sx={{ maxWidth: 700, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <LinkIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h4" gutterBottom color="primary">
              Redirecting...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You will be redirected to the original URL in {countdown} seconds
            </Typography>
          </Box>

          {/* Progress Bar */}
          <LinearProgress 
            variant="determinate" 
            value={(5 - countdown) * 20} 
            sx={{ mb: 4, height: 8, borderRadius: 4 }}
          />

          {/* URL Information */}
          {url && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Short URL: <strong>/{url.shortCode}</strong>
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  Destination: {url.originalUrl}
                </Typography>
              </Alert>

              {/* URL Details */}
              <Box sx={{ display: 'flex', gap: 1, mb: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Chip 
                  icon={<ScheduleIcon />}
                  label={`Created: ${new Date(url.createdAt).toLocaleDateString()}`}
                  variant="outlined"
                  size="small"
                />
                <Chip 
                  icon={<ScheduleIcon />}
                  label={`${url.clicks.length} previous clicks`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
                {url.customShortCode && (
                  <Chip 
                    label="Custom short code"
                    color="secondary"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>

              {/* Manual Actions */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={handleManualRedirect}
                >
                  Go Now
                </Button>
                <Button 
                  variant="outlined" 
                  href="/"
                  size="large"
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default RedirectHandler;
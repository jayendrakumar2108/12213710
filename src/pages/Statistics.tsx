import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Link as LinkIcon,
  Analytics as AnalyticsIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Source as SourceIcon,
} from '@mui/icons-material';

import { logger } from '../utils/logging';
import { urlService } from '../services/urlService';
import { ShortenedUrl, ClickData } from '../types';

interface UrlStatisticsProps {
  url: ShortenedUrl;
}

const UrlStatistics: React.FC<UrlStatisticsProps> = ({ url }) => {
  const shortUrl = urlService.getShortUrl(url.shortCode);
  const isExpired = new Date() > new Date(url.expiresAt);
  const timeRemaining = Math.max(0, Math.floor((new Date(url.expiresAt).getTime() - Date.now()) / 60000));

  const handleVisitUrl = () => {
    logger.info('Statistics', 'User clicked on short URL', { shortCode: url.shortCode });
    
    // Record click and redirect
    urlService.recordClick(url.shortCode, 'statistics_page');
    window.open(shortUrl, '_blank');
  };

  const getTopSources = () => {
    const sources: { [key: string]: number } = {};
    url.clicks.forEach(click => {
      sources[click.source] = (sources[click.source] || 0) + 1;
    });
    return Object.entries(sources)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getTopLocations = () => {
    const locations: { [key: string]: number } = {};
    url.clicks.forEach(click => {
      locations[click.location] = (locations[click.location] || 0) + 1;
    });
    return Object.entries(locations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getRecentClicks = () => {
    return url.clicks
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
              {url.customShortCode ? `Custom: ${url.shortCode}` : url.shortCode}
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ 
                wordBreak: 'break-all',
                color: 'text.secondary',
                backgroundColor: 'grey.50',
                p: 1,
                borderRadius: 1,
                mb: 1
              }}
            >
              {url.originalUrl}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<LinkIcon />}
                onClick={handleVisitUrl}
                disabled={isExpired}
              >
                Visit URL
              </Button>

              <Chip 
                icon={<AnalyticsIcon />}
                label={`${url.clicks.length} clicks`}
                color="primary"
                variant="outlined"
                size="small"
              />

              <Chip 
                icon={<ScheduleIcon />}
                label={isExpired ? 'Expired' : `${timeRemaining}m left`}
                color={isExpired ? 'error' : timeRemaining > 10 ? 'success' : 'warning'}
                size="small"
              />
            </Box>
          </Box>
        </Box>

        {/* Stats Grid */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'primary.light', borderRadius: 2, minWidth: 120, flexGrow: 1 }}>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {url.clicks.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Clicks
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'secondary.light', borderRadius: 2, minWidth: 120, flexGrow: 1 }}>
            <Typography variant="h4" color="secondary.main" fontWeight="bold">
              {new Set(url.clicks.map(c => c.location)).size}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Unique Locations
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'success.light', borderRadius: 2, minWidth: 120, flexGrow: 1 }}>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {new Set(url.clicks.map(c => c.source)).size}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Unique Sources
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'warning.light', borderRadius: 2, minWidth: 120, flexGrow: 1 }}>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {url.clicks.filter(c => {
                const clickTime = new Date(c.timestamp);
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return clickTime > oneDayAgo;
              }).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last 24h
            </Typography>
          </Box>
        </Box>

        {/* Detailed Analytics */}
        {url.clicks.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="600">
                Detailed Analytics
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
                {/* Top Sources */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    <SourceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Top Sources
                  </Typography>
                  {getTopSources().map(([source, count]) => (
                    <Box key={source} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{source}</Typography>
                      <Chip label={count} size="small" />
                    </Box>
                  ))}
                </Box>

                {/* Top Locations */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Top Locations
                  </Typography>
                  {getTopLocations().map(([location, count]) => (
                    <Box key={location} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{location}</Typography>
                      <Chip label={count} size="small" />
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Recent Clicks */}
              <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Recent Clicks
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>Source</TableCell>
                          <TableCell>Location</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getRecentClicks().map((click, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {new Date(click.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Chip label={click.source} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>{click.location}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {/* No clicks message */}
        {url.clicks.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No clicks recorded yet. Share your short URL to start collecting analytics!
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

const Statistics: React.FC = () => {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.info('Statistics', 'Statistics page loaded');
    loadUrls();
  }, []);

  const loadUrls = () => {
    setLoading(true);
    try {
      // Clean expired URLs first
      const removedCount = urlService.cleanExpiredUrls();
      if (removedCount > 0) {
        logger.info('Statistics', 'Cleaned expired URLs', { removedCount });
      }

      const allUrls = urlService.getAllUrls();
      setUrls(allUrls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      
      logger.info('Statistics', 'Loaded URL statistics', { urlCount: allUrls.length });
    } catch (error) {
      logger.error('Statistics', 'Failed to load URLs', { error });
    } finally {
      setLoading(false);
    }
  };

  const getTotalClicks = () => {
    return urls.reduce((total, url) => total + url.clicks.length, 0);
  };

  const getActiveUrls = () => {
    const now = new Date();
    return urls.filter(url => new Date(url.expiresAt) > now).length;
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Loading Statistics...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
          URL Statistics
        </Typography>
        
        <Tooltip title="Refresh data">
          <IconButton onClick={loadUrls} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="primary.main" fontWeight="bold">
              {urls.length}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Total URLs
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="success.main" fontWeight="bold">
              {getActiveUrls()}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Active URLs
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="secondary.main" fontWeight="bold">
              {getTotalClicks()}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Total Clicks
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="warning.main" fontWeight="bold">
              {urls.length - getActiveUrls()}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Expired URLs
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* URLs List */}
      {urls.length > 0 ? (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            All URLs
          </Typography>
          {urls.map((url) => (
            <UrlStatistics key={url.id} url={url} />
          ))}
        </Box>
      ) : (
        <Alert severity="info">
          No URLs created yet. Go to the URL Shortener page to create your first short URL!
        </Alert>
      )}
    </Box>
  );
};

export default Statistics;
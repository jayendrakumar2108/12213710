import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  Chip,
  IconButton,
  Divider,
  LinearProgress,
  Snackbar,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Link as LinkIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon 
} from '@mui/icons-material';

import { logger } from '../utils/logging';
import { urlService } from '../services/urlService';
import { UrlFormData, ShortenedUrl, CreateUrlRequest } from '../types';

interface UrlFormProps {
  index: number;
  data: UrlFormData;
  onChange: (index: number, data: UrlFormData) => void;
  onRemove: (index: number) => void;
  error?: string;
}

const UrlForm: React.FC<UrlFormProps> = ({ index, data, onChange, onRemove, error }) => {
  const handleChange = (field: keyof UrlFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(index, { ...data, [field]: event.target.value });
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="primary">
            URL #{index + 1}
          </Typography>
          <IconButton 
            onClick={() => onRemove(index)}
            disabled={index === 0}
            color="error"
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Original URL"
            placeholder="https://example.com/very-long-url"
            value={data.originalUrl}
            onChange={handleChange('originalUrl')}
            required
            error={!!error}
            helperText={error || 'Enter the URL you want to shorten'}
          />
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              fullWidth
              label="Validity (minutes)"
              type="number"
              placeholder="30"
              value={data.validityMinutes}
              onChange={handleChange('validityMinutes')}
              helperText="Default: 30 minutes"
              InputProps={{
                inputProps: { min: 1, max: 10080 } // Max 1 week
              }}
            />
            
            <TextField
              fullWidth
              label="Custom Short Code"
              placeholder="mycode123"
              value={data.customShortCode}
              onChange={handleChange('customShortCode')}
              helperText="Optional: 3-20 alphanumeric characters"
              inputProps={{
                pattern: '[a-zA-Z0-9]{3,20}',
                maxLength: 20
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

interface ResultCardProps {
  url: ShortenedUrl;
}

const ResultCard: React.FC<ResultCardProps> = ({ url }) => {
  const [copied, setCopied] = useState(false);

  const shortUrl = urlService.getShortUrl(url.shortCode);
  const expiresAt = new Date(url.expiresAt);
  const timeUntilExpiry = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 60000));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      logger.info('UrlShortener', 'Short URL copied to clipboard', { shortCode: url.shortCode });
    } catch (error) {
      logger.error('UrlShortener', 'Failed to copy URL', { error });
    }
  };

  return (
    <Card sx={{ mb: 2, border: '2px solid', borderColor: 'success.main' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LinkIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" color="success.main">
            URL Created Successfully!
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Original URL:
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                wordBreak: 'break-all',
                backgroundColor: 'grey.50',
                p: 1,
                borderRadius: 1
              }}
            >
              {url.originalUrl}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Short URL:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="h6" 
                color="primary"
                sx={{ 
                  backgroundColor: 'primary.light',
                  p: 1,
                  borderRadius: 1,
                  flexGrow: 1,
                  fontFamily: 'monospace'
                }}
              >
                {shortUrl}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCopy}
                startIcon={copied ? <CheckIcon /> : <CopyIcon />}
                color={copied ? 'success' : 'primary'}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Created:
              </Typography>
              <Typography variant="body1">
                {new Date(url.createdAt).toLocaleString()}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Expires:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1">
                  {expiresAt.toLocaleString()}
                </Typography>
                <Chip 
                  label={`${timeUntilExpiry}m left`}
                  size="small"
                  color={timeUntilExpiry > 10 ? 'success' : 'warning'}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const UrlShortener: React.FC = () => {
  const [forms, setForms] = useState<UrlFormData[]>([
    { originalUrl: '', validityMinutes: '', customShortCode: '' }
  ]);
  const [results, setResults] = useState<ShortenedUrl[]>([]);
  const [errors, setErrors] = useState<(string | undefined)[]>([undefined]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  React.useEffect(() => {
    logger.info('UrlShortener', 'URL Shortener page loaded');
  }, []);

  const addForm = () => {
    if (forms.length < 5) {
      setForms([...forms, { originalUrl: '', validityMinutes: '', customShortCode: '' }]);
      setErrors([...errors, undefined]);
      logger.info('UrlShortener', 'Added new URL form', { totalForms: forms.length + 1 });
    }
  };

  const removeForm = (index: number) => {
    if (forms.length > 1) {
      const newForms = forms.filter((_, i) => i !== index);
      const newErrors = errors.filter((_, i) => i !== index);
      setForms(newForms);
      setErrors(newErrors);
      logger.info('UrlShortener', 'Removed URL form', { index, remainingForms: newForms.length });
    }
  };

  const updateForm = (index: number, data: UrlFormData) => {
    const newForms = [...forms];
    newForms[index] = data;
    setForms(newForms);
    
    // Clear error when user starts typing
    if (errors[index]) {
      const newErrors = [...errors];
      newErrors[index] = undefined;
      setErrors(newErrors);
    }
  };

  const validateForms = (): boolean => {
    const newErrors: (string | undefined)[] = [];
    let hasErrors = false;

    forms.forEach((form, index) => {
      if (!form.originalUrl.trim()) {
        newErrors[index] = 'URL is required';
        hasErrors = true;
        return;
      }

      const urlValidation = urlService.validateUrl(form.originalUrl);
      if (!urlValidation.isValid) {
        newErrors[index] = urlValidation.error;
        hasErrors = true;
        return;
      }

      if (form.customShortCode) {
        const codeValidation = urlService.validateShortCode(form.customShortCode);
        if (!codeValidation.isValid) {
          newErrors[index] = codeValidation.error;
          hasErrors = true;
          return;
        }
      }

      if (form.validityMinutes && (isNaN(Number(form.validityMinutes)) || Number(form.validityMinutes) <= 0)) {
        newErrors[index] = 'Validity must be a positive number';
        hasErrors = true;
        return;
      }

      newErrors[index] = undefined;
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = async () => {
    logger.info('UrlShortener', 'Starting URL creation process', { formCount: forms.length });
    
    if (!validateForms()) {
      logger.warn('UrlShortener', 'Form validation failed');
      setSnackbar({
        open: true,
        message: 'Please fix the errors in the form',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const requests: CreateUrlRequest[] = forms.map(form => ({
        originalUrl: form.originalUrl,
        validityMinutes: form.validityMinutes ? Number(form.validityMinutes) : 30,
        customShortCode: form.customShortCode || undefined
      }));

      const batchResult = urlService.createMultipleUrls({ urls: requests });
      
      if (batchResult.successful.length > 0) {
        setResults(batchResult.successful);
        logger.info('UrlShortener', 'URLs created successfully', { 
          successful: batchResult.successful.length,
          failed: batchResult.failed.length 
        });

        setSnackbar({
          open: true,
          message: `Successfully created ${batchResult.successful.length} short URL(s)`,
          severity: 'success'
        });

        // Reset forms
        setForms([{ originalUrl: '', validityMinutes: '', customShortCode: '' }]);
        setErrors([undefined]);
      }

      if (batchResult.failed.length > 0) {
        logger.warn('UrlShortener', 'Some URLs failed to create', { failures: batchResult.failed });
        
        const newErrors = [...errors];
        batchResult.failed.forEach(failure => {
          const index = requests.findIndex(req => req.originalUrl === failure.request.originalUrl);
          if (index !== -1) {
            newErrors[index] = failure.error;
          }
        });
        setErrors(newErrors);

        setSnackbar({
          open: true,
          message: `${batchResult.failed.length} URL(s) failed to create`,
          severity: 'error'
        });
      }
    } catch (error) {
      logger.error('UrlShortener', 'Unexpected error during URL creation', { error });
      setSnackbar({
        open: true,
        message: 'An unexpected error occurred',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        URL Shortener
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Create up to 5 shortened URLs at once. Each URL can have custom validity and short codes.
      </Typography>

      {/* URL Forms */}
      <Box sx={{ mb: 4 }}>
        {forms.map((form, index) => (
          <UrlForm
            key={index}
            index={index}
            data={form}
            onChange={updateForm}
            onRemove={removeForm}
            error={errors[index]}
          />
        ))}

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addForm}
            disabled={forms.length >= 5}
          >
            Add URL ({forms.length}/5)
          </Button>

          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={loading || forms.some(f => !f.originalUrl.trim())}
            sx={{ minWidth: 200 }}
          >
            {loading ? 'Creating...' : `Create ${forms.length} URL${forms.length > 1 ? 's' : ''}`}
          </Button>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}
      </Box>

      {/* Results */}
      {results.length > 0 && (
        <Box>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h5" gutterBottom sx={{ color: 'success.main', fontWeight: 600 }}>
            ✓ Created Short URLs
          </Typography>
          
          {results.map((url) => (
            <ResultCard key={url.id} url={url} />
          ))}
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UrlShortener;
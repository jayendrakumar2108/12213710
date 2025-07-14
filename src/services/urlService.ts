// Affordmed URL Shortener - Client-Side URL Management Service

import { 
  ShortenedUrl, 
  CreateUrlRequest, 
  CreateUrlResponse, 
  BatchCreateRequest, 
  BatchCreateResponse,
  ClickData,
  UrlValidationResult,
  ShortCodeValidationResult 
} from '../types';
import { logger } from '../utils/logging';

const STORAGE_KEY = 'affordmed_shortened_urls';
const BASE_URL = 'http://localhost:3000';

class UrlService {
  
  // URL Validation
  validateUrl(url: string): UrlValidationResult {
    logger.debug('UrlService', 'Validating URL', { url });
    
    if (!url || url.trim().length === 0) {
      return { isValid: false, error: 'URL is required' };
    }

    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { isValid: false, error: 'URL must use HTTP or HTTPS protocol' };
      }
      
      logger.info('UrlService', 'URL validation successful', { url });
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  }

  // Short Code Validation
  validateShortCode(shortCode: string): ShortCodeValidationResult {
    logger.debug('UrlService', 'Validating short code', { shortCode });
    
    if (shortCode.length === 0) {
      return { isValid: true, isUnique: true };
    }

    // Check format (alphanumeric, 3-20 characters)
    const codeRegex = /^[a-zA-Z0-9]{3,20}$/;
    if (!codeRegex.test(shortCode)) {
      return { 
        isValid: false, 
        isUnique: false, 
        error: 'Short code must be 3-20 alphanumeric characters' 
      };
    }

    // Check uniqueness
    const existingUrls = this.getAllUrls();
    const isUnique = !existingUrls.some(url => 
      url.shortCode === shortCode || url.customShortCode === shortCode
    );

    if (!isUnique) {
      return { 
        isValid: false, 
        isUnique: false, 
        error: 'Short code already exists' 
      };
    }

    logger.info('UrlService', 'Short code validation successful', { shortCode });
    return { isValid: true, isUnique: true };
  }

  // Generate unique short code
  private generateShortCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const existingUrls = this.getAllUrls();
    
    do {
      result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (existingUrls.some(url => url.shortCode === result));

    logger.debug('UrlService', 'Generated unique short code', { shortCode: result });
    return result;
  }

  // Create shortened URL
  createShortenedUrl(request: CreateUrlRequest): CreateUrlResponse {
    logger.info('UrlService', 'Creating shortened URL', request);

    try {
      // Validate URL
      const urlValidation = this.validateUrl(request.originalUrl);
      if (!urlValidation.isValid) {
        logger.warn('UrlService', 'URL validation failed', { error: urlValidation.error });
        return { success: false, error: urlValidation.error };
      }

      // Validate custom short code if provided
      if (request.customShortCode) {
        const codeValidation = this.validateShortCode(request.customShortCode);
        if (!codeValidation.isValid) {
          logger.warn('UrlService', 'Short code validation failed', { error: codeValidation.error });
          return { success: false, error: codeValidation.error };
        }
      }

      // Create URL object
      const now = new Date();
      const validityMinutes = request.validityMinutes || 30;
      const expiresAt = new Date(now.getTime() + validityMinutes * 60000);
      
      const shortenedUrl: ShortenedUrl = {
        id: `url_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        originalUrl: request.originalUrl,
        shortCode: request.customShortCode || this.generateShortCode(),
        customShortCode: request.customShortCode,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        validityMinutes,
        clicks: [],
        isActive: true
      };

      // Store in localStorage
      const existingUrls = this.getAllUrls();
      existingUrls.push(shortenedUrl);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingUrls));

      logger.info('UrlService', 'Successfully created shortened URL', { 
        id: shortenedUrl.id, 
        shortCode: shortenedUrl.shortCode 
      });

      return { success: true, data: shortenedUrl };
    } catch (error) {
      logger.error('UrlService', 'Failed to create shortened URL', { error });
      return { success: false, error: 'Failed to create shortened URL' };
    }
  }

  // Batch create URLs
  createMultipleUrls(request: BatchCreateRequest): BatchCreateResponse {
    logger.info('UrlService', 'Creating multiple URLs', { count: request.urls.length });

    const successful: ShortenedUrl[] = [];
    const failed: { request: CreateUrlRequest; error: string }[] = [];

    for (const urlRequest of request.urls) {
      const result = this.createShortenedUrl(urlRequest);
      if (result.success && result.data) {
        successful.push(result.data);
      } else {
        failed.push({ request: urlRequest, error: result.error || 'Unknown error' });
      }
    }

    logger.info('UrlService', 'Batch creation completed', { 
      successful: successful.length, 
      failed: failed.length 
    });

    return { successful, failed };
  }

  // Get all URLs
  getAllUrls(): ShortenedUrl[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      logger.warn('UrlService', 'Failed to load URLs from storage');
      return [];
    }
  }

  // Get URL by short code
  getUrlByShortCode(shortCode: string): ShortenedUrl | null {
    logger.debug('UrlService', 'Looking up URL by short code', { shortCode });
    
    const urls = this.getAllUrls();
    const url = urls.find(u => u.shortCode === shortCode);
    
    if (url) {
      // Check if expired
      const now = new Date();
      const expiresAt = new Date(url.expiresAt);
      
      if (now > expiresAt) {
        logger.warn('UrlService', 'URL has expired', { shortCode, expiresAt: url.expiresAt });
        return null;
      }
      
      logger.info('UrlService', 'Found active URL', { shortCode, id: url.id });
      return url;
    }
    
    logger.warn('UrlService', 'URL not found', { shortCode });
    return null;
  }

  // Record click
  recordClick(shortCode: string, source: string = 'direct'): boolean {
    logger.info('UrlService', 'Recording click', { shortCode, source });

    try {
      const urls = this.getAllUrls();
      const urlIndex = urls.findIndex(u => u.shortCode === shortCode);
      
      if (urlIndex === -1) {
        logger.warn('UrlService', 'Cannot record click - URL not found', { shortCode });
        return false;
      }

      // Mock geolocation data
      const locations = ['New York, US', 'London, UK', 'Mumbai, IN', 'Tokyo, JP', 'Sydney, AU'];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];

      const clickData: ClickData = {
        timestamp: new Date().toISOString(),
        source,
        location: randomLocation,
        userAgent: navigator.userAgent,
        ip: '192.168.1.1' // Mock IP
      };

      urls[urlIndex].clicks.push(clickData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));

      logger.info('UrlService', 'Click recorded successfully', { 
        shortCode, 
        clickCount: urls[urlIndex].clicks.length 
      });

      return true;
    } catch (error) {
      logger.error('UrlService', 'Failed to record click', { error, shortCode });
      return false;
    }
  }

  // Get full short URL
  getShortUrl(shortCode: string): string {
    return `${BASE_URL}/${shortCode}`;
  }

  // Clean expired URLs
  cleanExpiredUrls(): number {
    logger.info('UrlService', 'Cleaning expired URLs');
    
    try {
      const urls = this.getAllUrls();
      const now = new Date();
      const activeUrls = urls.filter(url => {
        const expiresAt = new Date(url.expiresAt);
        return now <= expiresAt;
      });
      
      const removedCount = urls.length - activeUrls.length;
      
      if (removedCount > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activeUrls));
        logger.info('UrlService', 'Expired URLs cleaned', { removedCount });
      }
      
      return removedCount;
    } catch (error) {
      logger.error('UrlService', 'Failed to clean expired URLs', { error });
      return 0;
    }
  }

  // Delete URL
  deleteUrl(id: string): boolean {
    logger.info('UrlService', 'Deleting URL', { id });
    
    try {
      const urls = this.getAllUrls();
      const filteredUrls = urls.filter(url => url.id !== id);
      
      if (filteredUrls.length < urls.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredUrls));
        logger.info('UrlService', 'URL deleted successfully', { id });
        return true;
      }
      
      logger.warn('UrlService', 'URL not found for deletion', { id });
      return false;
    } catch (error) {
      logger.error('UrlService', 'Failed to delete URL', { error, id });
      return false;
    }
  }

  // Clear all URLs
  clearAllUrls(): void {
    logger.info('UrlService', 'Clearing all URLs');
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const urlService = new UrlService();
// Affordmed URL Shortener - Type Definitions

export interface ClickData {
  timestamp: string;
  source: string;
  location: string;
  userAgent?: string;
  ip?: string;
}

export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  customShortCode?: string;
  createdAt: string;
  expiresAt: string;
  validityMinutes: number;
  clicks: ClickData[];
  isActive: boolean;
}

export interface CreateUrlRequest {
  originalUrl: string;
  validityMinutes?: number;
  customShortCode?: string;
}

export interface CreateUrlResponse {
  success: boolean;
  data?: ShortenedUrl;
  error?: string;
}

export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ShortCodeValidationResult {
  isValid: boolean;
  isUnique: boolean;
  error?: string;
}

export interface BatchCreateRequest {
  urls: CreateUrlRequest[];
}

export interface BatchCreateResponse {
  successful: ShortenedUrl[];
  failed: { request: CreateUrlRequest; error: string }[];
}

// Analytics interfaces
export interface UrlAnalytics {
  totalClicks: number;
  recentClicks: ClickData[];
  topSources: { source: string; count: number }[];
  topLocations: { location: string; count: number }[];
  clicksByHour: { hour: number; count: number }[];
}

// Component prop types
export interface UrlFormData {
  originalUrl: string;
  validityMinutes: string;
  customShortCode: string;
}

export interface UrlCardProps {
  url: ShortenedUrl;
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
}

export interface StatisticsTableProps {
  urls: ShortenedUrl[];
  onRefresh?: () => void;
}
/**
 * Application Configuration
 * Centralizes all environment-specific settings
 */

// API Base URL - defaults to local development
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Environment helpers
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

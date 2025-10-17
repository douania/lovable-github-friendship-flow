/**
 * Secure logging utility for production
 * Only logs in development mode to prevent sensitive data exposure
 */

const isDev = import.meta.env.DEV;

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDev) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },

  error: (message: string, error?: any) => {
    if (isDev) {
      console.error(`[ERROR] ${message}`, error);
    } else {
      // In production, only log sanitized error messages
      console.error(`[ERROR] ${message}`);
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (isDev) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  debug: (message: string, ...args: any[]) => {
    if (isDev) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },

  // Never logs in production - use for sensitive data
  sensitive: (message: string, data?: any) => {
    if (isDev) {
      console.log(`[SENSITIVE] ${message}`, data);
    }
  }
};

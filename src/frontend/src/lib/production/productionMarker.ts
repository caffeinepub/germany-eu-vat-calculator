/**
 * Production build marker for deployment verification
 * Logs a console marker only in production builds to help verify deployment
 */

import { APP_META } from '@/config/appMeta';

const PRODUCTION_VERSION = 'v39';
const MARKER_MESSAGE = `🚀 ${APP_META.displayName} ${PRODUCTION_VERSION} - Production Build`;

/**
 * Logs the production version marker to the console
 * This helps verify that the correct version is deployed
 */
export function logProductionMarker(): void {
  // Only log in production builds (when not in development mode)
  if (import.meta.env.MODE === 'production') {
    console.log(MARKER_MESSAGE);
  }
}

/**
 * Get the production marker message (for testing)
 */
export function getProductionMarker(): string {
  return MARKER_MESSAGE;
}

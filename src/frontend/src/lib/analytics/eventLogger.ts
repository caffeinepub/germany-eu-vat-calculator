import { type backendInterface, type EventRecord } from '../../backend';
import { type CoreEventName } from './coreEvents';

export interface LogEventParams {
  eventName: CoreEventName;
  country?: string;
  page?: string;
  device?: string;
  metadata?: string;
  fingerprint?: string;
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return 'mobile';
  if (/tablet/i.test(ua)) return 'tablet';
  return 'desktop';
}

function getCurrentPage(): string {
  return window.location.pathname;
}

export async function logEvent(
  actor: backendInterface | null,
  params: LogEventParams
): Promise<void> {
  if (!actor) {
    console.warn('Event logging skipped: actor not available');
    return;
  }

  try {
    const eventRecord: EventRecord = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      event_name: params.eventName,
      country: params.country || '',
      page: params.page || getCurrentPage(),
      device: params.device || getDeviceType(),
      timestamp: BigInt(Date.now() * 1_000_000), // Convert to nanoseconds
      metadata: params.metadata || '',
    };

    await actor.logEvent(eventRecord);
  } catch (error) {
    // Fail silently - don't break user flow
    console.error('Event logging failed:', error);
  }
}

import { useActor } from './useActor';
import { useDailyFingerprint } from './useDailyFingerprint';
import { logEvent, type LogEventParams } from '../lib/analytics/eventLogger';
import { type CoreEventName } from '../lib/analytics/coreEvents';

export function useEventLogger() {
  const { actor } = useActor();
  const { fingerprint, country } = useDailyFingerprint();

  const log = async (
    eventName: CoreEventName,
    metadata?: string,
    overrides?: Partial<LogEventParams>
  ) => {
    await logEvent(actor, {
      eventName,
      country: overrides?.country || country || '',
      metadata: metadata || '',
      fingerprint: fingerprint || undefined,
      ...overrides,
    });
  };

  return { log, fingerprint, country };
}

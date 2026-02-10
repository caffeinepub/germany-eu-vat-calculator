import { useState, useEffect } from 'react';
import { getDailyFingerprint } from '../lib/analytics/fingerprint';
import { detectCountryFromIP } from '../lib/analytics/countryDetection';

interface FingerprintData {
  fingerprint: string | null;
  country: string | null;
  isAvailable: boolean;
  isLoading: boolean;
}

export function useDailyFingerprint(): FingerprintData {
  const [data, setData] = useState<FingerprintData>({
    fingerprint: null,
    country: null,
    isAvailable: false,
    isLoading: true,
  });

  useEffect(() => {
    let mounted = true;

    async function fetchFingerprint() {
      try {
        const detection = await detectCountryFromIP();
        
        if (!mounted) return;
        
        if (detection) {
          const fingerprint = await getDailyFingerprint(detection.ip);
          
          if (mounted) {
            setData({
              fingerprint,
              country: detection.country,
              isAvailable: true,
              isLoading: false,
            });
          }
        } else {
          if (mounted) {
            setData({
              fingerprint: null,
              country: null,
              isAvailable: false,
              isLoading: false,
            });
          }
        }
      } catch (error) {
        console.warn('Fingerprint computation failed:', error);
        if (mounted) {
          setData({
            fingerprint: null,
            country: null,
            isAvailable: false,
            isLoading: false,
          });
        }
      }
    }

    fetchFingerprint();

    return () => {
      mounted = false;
    };
  }, []);

  return data;
}

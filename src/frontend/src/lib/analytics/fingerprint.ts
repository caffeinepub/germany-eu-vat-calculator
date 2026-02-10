// Daily fingerprint computation using Web Crypto API
// hash(IP + user_agent + day) - GDPR-safe, no personal data stored

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

function getDayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export async function computeDailyFingerprint(ip: string): Promise<string> {
  const userAgent = navigator.userAgent;
  const dayString = getDayString();
  const rawString = `${ip}|${userAgent}|${dayString}`;
  return await sha256(rawString);
}

// Session cache for fingerprint (recomputed daily)
let cachedFingerprint: string | null = null;
let cachedDay: string | null = null;

export async function getDailyFingerprint(ip: string): Promise<string> {
  const currentDay = getDayString();
  
  if (cachedFingerprint && cachedDay === currentDay) {
    return cachedFingerprint;
  }
  
  cachedFingerprint = await computeDailyFingerprint(ip);
  cachedDay = currentDay;
  return cachedFingerprint;
}

export function clearFingerprintCache(): void {
  cachedFingerprint = null;
  cachedDay = null;
}

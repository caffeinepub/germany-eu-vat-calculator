// Best-effort IP-based country detection
// Uses public IP geolocation API (no raw IP persisted)

export async function detectCountryFromIP(): Promise<{ country: string; ip: string } | null> {
  try {
    // Use ipapi.co for country detection (free tier, no auth required)
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn('Country detection failed:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (data.country_code && data.ip) {
      return {
        country: data.country_code,
        ip: data.ip,
      };
    }
    
    return null;
  } catch (error) {
    console.warn('Country detection error:', error);
    return null;
  }
}

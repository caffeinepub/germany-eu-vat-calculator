import { useState, useEffect } from 'react';

export function usePreferredLanguage() {
  const [language, setLanguage] = useState<string>('en');

  useEffect(() => {
    // Get browser's preferred language
    const browserLang = navigator.language || (navigator as any).userLanguage || 'en';
    // Normalize to language code (e.g., 'en-US' -> 'en')
    const langCode = browserLang.split('-')[0].toLowerCase();
    setLanguage(langCode);
  }, []);

  return { language, isEnglish: language === 'en' };
}

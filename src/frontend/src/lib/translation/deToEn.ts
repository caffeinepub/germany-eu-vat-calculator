/**
 * Deterministic offline German to English translation utility.
 * Uses a fixed dictionary for consistent translation results.
 * Only intended for invoice detail fields, not VAT calculations.
 */

const germanToEnglishDict: Record<string, string> = {
  // Common business terms
  'firma': 'company',
  'unternehmen': 'company',
  'gesellschaft': 'company',
  'gmbh': 'GmbH',
  'ag': 'AG',
  'straße': 'street',
  'strasse': 'street',
  'str.': 'st.',
  'platz': 'square',
  'weg': 'way',
  'allee': 'avenue',
  'gasse': 'lane',
  'deutschland': 'Germany',
  'österreich': 'Austria',
  'schweiz': 'Switzerland',
  
  // Address components
  'postleitzahl': 'postal code',
  'plz': 'postal code',
  'stadt': 'city',
  'land': 'country',
  'hausnummer': 'house number',
  'nr.': 'no.',
  'nummer': 'number',
  
  // Invoice terms
  'rechnung': 'invoice',
  'angebot': 'quote',
  'lieferung': 'delivery',
  'dienstleistung': 'service',
  'produkt': 'product',
  'artikel': 'item',
  'ware': 'goods',
  'beratung': 'consulting',
  'entwicklung': 'development',
  'design': 'design',
  'programmierung': 'programming',
  'software': 'software',
  'hardware': 'hardware',
  'lizenz': 'license',
  'wartung': 'maintenance',
  'support': 'support',
  'schulung': 'training',
  'projekt': 'project',
  'stunde': 'hour',
  'stunden': 'hours',
  'tag': 'day',
  'tage': 'days',
  'monat': 'month',
  'monate': 'months',
  'jahr': 'year',
  'jahre': 'years',
  
  // Common words
  'und': 'and',
  'oder': 'or',
  'für': 'for',
  'von': 'from',
  'zu': 'to',
  'mit': 'with',
  'bei': 'at',
  'in': 'in',
  'an': 'at',
  'auf': 'on',
  'über': 'about',
  'unter': 'under',
  'nach': 'after',
  'vor': 'before',
  'zwischen': 'between',
  'durch': 'through',
  'ohne': 'without',
  'gegen': 'against',
  'um': 'around',
  'bis': 'until',
  'seit': 'since',
  'während': 'during',
  'wegen': 'because of',
  'trotz': 'despite',
  
  // Numbers
  'eins': 'one',
  'zwei': 'two',
  'drei': 'three',
  'vier': 'four',
  'fünf': 'five',
  'sechs': 'six',
  'sieben': 'seven',
  'acht': 'eight',
  'neun': 'nine',
  'zehn': 'ten',
  
  // Titles
  'herr': 'Mr.',
  'frau': 'Ms.',
  'dr.': 'Dr.',
  'prof.': 'Prof.',
};

/**
 * Translates German text to English using a deterministic dictionary approach.
 * Returns the same output for the same input (deterministic).
 * Works offline without any network calls.
 */
export function translateGermanToEnglish(text: string): string {
  if (!text || text.trim().length === 0) {
    return text;
  }

  // Split text into words while preserving punctuation and whitespace
  const words = text.split(/(\s+|[.,;:!?()[\]{}])/);
  
  const translatedWords = words.map(word => {
    // Preserve whitespace and punctuation as-is
    if (/^\s+$/.test(word) || /^[.,;:!?()[\]{}]+$/.test(word)) {
      return word;
    }
    
    // Convert to lowercase for dictionary lookup
    const lowerWord = word.toLowerCase();
    
    // Check if word exists in dictionary
    if (germanToEnglishDict[lowerWord]) {
      // Preserve original capitalization pattern
      const translation = germanToEnglishDict[lowerWord];
      
      if (word[0] === word[0].toUpperCase()) {
        // First letter was uppercase
        return translation.charAt(0).toUpperCase() + translation.slice(1);
      }
      
      return translation;
    }
    
    // Return original word if no translation found
    return word;
  });
  
  return translatedWords.join('');
}

/**
 * Checks if text appears to contain German characters or words.
 * Simple heuristic for UI feedback.
 */
export function looksLikeGerman(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return false;
  }
  
  const germanIndicators = [
    'ä', 'ö', 'ü', 'ß',
    'straße', 'strasse', 'gmbh',
    'deutschland', 'österreich', 'schweiz',
  ];
  
  const lowerText = text.toLowerCase();
  return germanIndicators.some(indicator => lowerText.includes(indicator));
}

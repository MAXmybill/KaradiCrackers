// Tamil names and translations for cracker categories in Sivakasi cracker stores

export const CATEGORY_TAMIL_NAMES: Record<string, string> = {
  'SATTAI': 'சாட்டை',
  'SPARKLERS': 'கம்பி மத்தாப்பு',
  'MATCH BOXES': 'தீப்பெட்டி ரகங்கள்',
  'CHAKKRA & SPINNERS': 'சக்கரம் & ஸ்பின்னர்ஸ்',
  'FLOWER POTS': 'பூந்தொட்டி / அனார்',
  'GUJARAT POTS': 'குஜராத் பாட்ஸ் (ரிம்ஜிம்)',
  'BOMBS': 'வெடி & அணுகுண்டு',
  'PAPER BOMBS': 'பேப்பர் பாம்ப்',
  'KIDS': 'சிறுவர் பட்டாசு',
  'ROCKETS': 'ராக்கெட் ரகங்கள்',
  'FANCY PIPES': 'ஃபேன்சி ஸ்கை ஷாட்ஸ் (பைப்)',
  'DAY FANCY': 'பகல் ஃபேன்சி',
  'NIGHT SHOTS': 'நைட் ஷாட்ஸ்',
  'NIGHT FANCY': 'இரவு ஃபேன்சி ரகங்கள்',
  'GIFT BOXES': 'கிஃப்ட் பாக்ஸ் ரகங்கள்',
  'WALA': 'சரவெடி / வாலா',
  'WALA HC': 'வாலா HC (சரவெடி)',
  'WALA FC': 'வாலா FC (சரவெடி)',
};

/**
 * Returns formatted category label with Tamil name
 * Example: "SPARKLERS (கம்பி மத்தாப்பு)"
 * Supports dynamic store-configured category translations from Firestore settings
 */
export function getCategoryDisplayName(
  categoryName: string,
  customTranslations?: Record<string, string>
): { english: string; tamil: string; combined: string } {
  const upper = (categoryName || '').toUpperCase().trim();
  const tamil = customTranslations?.[upper] || customTranslations?.[categoryName] || CATEGORY_TAMIL_NAMES[upper] || '';
  return {
    english: categoryName,
    tamil,
    combined: tamil ? `${categoryName} (${tamil})` : categoryName
  };
}

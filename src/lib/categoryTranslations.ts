// Tamil names and translations for cracker categories in Sivakasi cracker stores

export const CATEGORY_TAMIL_NAMES: Record<string, string> = {
  // Exact user catalog categories
  'SATTAI': 'சாட்டை',
  'SPARKLERS': 'கம்பி மத்தாப்பு',
  'GROUND CHAKKRA': 'தரை சக்கரம்',
  'FANCY CHAKKRAS': 'ஃபேன்சி சக்கரம்',
  'FLOWER POTS': 'பூந்தொட்டி / அனார்',
  'FANCY FLOWER POTS': 'ஃபேன்சி பூந்தொட்டி',
  'GUJARAT F/P': 'குஜராத் பாட்ஸ்',
  'FANCY GUJARAT F/P': 'ஃபேன்சி குஜராத் பாட்ஸ்',
  'BOMBS': 'வெடி & அணுகுண்டு',
  'MEGA BOMBS': 'மெகா பாம்ப்',
  'PAPER BOMBS': 'பேப்பர் பாம்ப்',
  'KIDS': 'சிறுவர் பட்டாசு',
  'KIDS SPECIAL': 'கிட்ஸ் ஸ்பெஷல்',
  'ROCKETS': 'ராக்கெட் ரகங்கள்',
  'SKY SHOTS': 'ஸ்கை ஷாட்ஸ்',
  'MEGA PIPES': 'மெகா பைப்',
  'DAY FANCY': 'பகல் ஃபேன்சி',
  'NIGHT SHOTS': 'நைட் ஷாட்ஸ்',
  'FAN CAKE & SET OUTS': 'ஃபேன் கேக் & செட் அவுட்',
  'NIGHT FANCY': 'இரவு ஃபேன்சி ரகங்கள்',
  'WALA': 'சரவெடி / வாலா',
  'MEGA WALA': 'மெகா வாலா சரவெடி',
  'GIFT BOXES': 'கிஃப்ட் பாக்ஸ் ரகங்கள்',

  // Legacy / variant names
  'CHAKKRA & SPINNERS': 'சக்கரம் & ஸ்பின்னர்ஸ்',
  'GUJARAT POTS': 'குஜராத் பாட்ஸ் (ரிம்ஜிம்)',
  'FANCY PIPES': 'ஃபேன்சி ஸ்கை ஷாட்ஸ் (பைப்)',
  'MATCH BOXES': 'தீப்பெட்டி ரகங்கள்',
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

const LETTER_PREFIX = /^([A-D])[\).\]:]\s*/i;

/**
 * Normalize model output to a single letter A–D.
 */
export function normalizeAnswerLetter(value) {
  if (!value) return null;
  const s = String(value).trim();
  const m = s.match(LETTER_PREFIX) || s.match(/^([A-D])$/i);
  return m ? m[1].toUpperCase() : s.charAt(0).toUpperCase();
}

/**
 * Letter for an option at index, from option text or fallback index.
 */
export function getOptionLetter(option, index) {
  const letters = ['A', 'B', 'C', 'D'];
  if (typeof option === 'string') {
    const m = option.match(LETTER_PREFIX);
    if (m) return m[1].toUpperCase();
  }
  return letters[index] ?? 'A';
}

/**
 * Strip leading "A) " from option display text.
 */
export function getOptionDisplayText(option) {
  if (typeof option !== 'string') return String(option);
  return option.replace(LETTER_PREFIX, '').trim();
}

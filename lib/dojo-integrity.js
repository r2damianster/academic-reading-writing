/* lib/dojo-integrity.js
 * Validación básica de integridad académica para Dojo exercises
 */

function validateExerciseAnswer(answerText) {
  const trimmed = answerText.trim();
  const chars = trimmed.length;
  const words = trimmed.split(/\s+/).filter(w => w.length > 0).length;

  // Check 1: Longitud mínima
  if (chars < 50) {
    return { valid: false, reason: 'too_short', message: 'Answer too short. Minimum 50 characters required.' };
  }

  // Check 2: Palabra mínima
  if (words < 10) {
    return { valid: false, reason: 'too_few_words', message: 'Minimum 10 words required.' };
  }

  // Check 3: Texto repetitivo
  if (words > 5) {
    const wordCounts = {};
    trimmed.split(/\s+/).forEach(w => {
      const lower = w.toLowerCase();
      wordCounts[lower] = (wordCounts[lower] || 0) + 1;
    });
    const maxCount = Math.max(...Object.values(wordCounts));
    const maxRatio = maxCount / words;

    if (maxRatio > 0.6) {
      return { valid: false, reason: 'repetitive', message: 'Text appears to be repetitive. Please provide original content.' };
    }
  }

  // Check 4: Espacios en blanco excesivo
  const nonWhitespace = trimmed.replace(/\s/g, '').length;
  if (nonWhitespace < 40) {
    return { valid: false, reason: 'mostly_whitespace', message: 'Answer appears to be mostly empty.' };
  }

  return { valid: true, message: 'Answer meets requirements.' };
}

module.exports = { validateExerciseAnswer };

export function shuffleArray(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function getRandomItems(arr, count, exclude = []) {
  const filtered = arr.filter(item => !exclude.includes(item));
  const shuffled = shuffleArray(filtered);
  return shuffled.slice(0, count);
}

export function formatPercentage(correct, total) {
  if (total === 0) return '0%';
  return Math.round((correct / total) * 100) + '%';
}

export const getSubjectContentType = (subject) => {
  if (subject === 'Materia Medica') return 'remedy';
  if (subject === 'Organon of Medicine') return 'principle';
  return 'concept'; // Default to Anatomy, Physiology, Surgery, Pathology, etc.
};

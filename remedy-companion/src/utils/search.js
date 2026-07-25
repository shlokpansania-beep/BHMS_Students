export function searchRemedies(items, query, filter = 'all', type = 'remedy') {
  if (!query || !query.trim()) return [];

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  const results = items.map(item => {
    let score = 0;
    const matchedFields = new Set();

    terms.forEach(term => {
      const matchField = (field, weight, fieldName) => {
        if (field && String(field).toLowerCase().includes(term)) {
          score += weight;
          matchedFields.add(fieldName);
        }
      };
      
      const matchArray = (arr, weight, fieldName) => {
        if (!arr) return;
        arr.forEach(element => {
          if (String(element).toLowerCase().includes(term)) {
            score += weight;
            matchedFields.add(fieldName);
          }
        });
      };

      if (type === 'remedy') {
        if (filter === 'all' || filter === 'physical') {
          matchArray(item.keynotes, 3, 'keynotes');
          matchArray(item.common_uses, 1, 'common_uses');
        }

        if (filter === 'all' || filter === 'mind') {
          matchArray(item.mind_symptoms, 2, 'mind_symptoms');
        }

        if (filter === 'all' || filter === 'modalities') {
          if (item.modalities) {
            matchArray(item.modalities.worse, 2, 'modalities_worse');
            matchArray(item.modalities.better, 2, 'modalities_better');
          }
        }
      } else if (type === 'concept') {
        matchField(item.title, 3, 'title');
        matchField(item.definition, 2, 'definition');
        matchArray(item.key_points, 2, 'key_points');
        matchArray(item.related_terms, 1, 'related_terms');
      } else if (type === 'principle') {
        matchField(item.principle_name, 3, 'name');
        matchField(item.explanation, 2, 'explanation');
        matchField(item.example, 1, 'example');
      }
    });

    return {
      remedy: item, // Map to 'remedy' key so page components don't break their prop queries
      score,
      matchedFields: Array.from(matchedFields)
    };
  }).filter(result => result.score > 0);

  return results.sort((a, b) => b.score - a.score);
}

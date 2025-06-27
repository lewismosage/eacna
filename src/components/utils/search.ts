import searchIndex from './searchIndex';
import type { SearchItem } from './searchIndex';

/**
 * Search function that returns matches from the searchIndex based on a given query
 * @param query - The search term provided by the user
 * @param options - Optional configuration for the search
 * @returns Array of matching SearchItem objects
 */
export function search(
  query: string, 
  options: {
    limit?: number;
    category?: string | string[];
    fuzzyMatch?: boolean;
    boostExactMatches?: boolean;
  } = {}
): { results: SearchItem[], totalMatches: number } {
  // If no query, return empty results
  if (!query || query.trim() === '') {
    return { results: [], totalMatches: 0 };
  }
  
  const {
    limit = 10,
    category,
    fuzzyMatch = true,
    boostExactMatches = true
  } = options;
  
  const normalizedQuery = query.toLowerCase().trim();
  const queryTerms = normalizedQuery.split(/\s+/);
  
  // Filter by query
  let matches = searchIndex.map(item => {
    // Calculate a relevance score
    let score = 0;
    
    // Check title for matches
    if (item.title.toLowerCase().includes(normalizedQuery)) {
      score += 10; // Highest priority for exact title match
      
      // Boost for exact title match
      if (boostExactMatches && item.title.toLowerCase() === normalizedQuery) {
        score += 15;
      }
    }
    
    // Check description for matches
    if (item.description.toLowerCase().includes(normalizedQuery)) {
      score += 5;
    }
    
    // Check keywords for exact matches
    for (const keyword of item.keywords) {
      if (keyword.toLowerCase() === normalizedQuery) {
        score += 8; // High score for exact keyword match
      } else if (keyword.toLowerCase().includes(normalizedQuery)) {
        score += 6; // Good score for partial keyword match
      }
    }
    
    // For fuzzy matching, check if individual query terms match
    if (fuzzyMatch && queryTerms.length > 1) {
      let matchedTerms = 0;
      
      for (const term of queryTerms) {
        if (term.length <= 2) continue; // Skip very short terms
        
        if (
          item.title.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term) ||
          item.keywords.some(k => k.toLowerCase().includes(term))
        ) {
          matchedTerms++;
        }
      }
      
      // Add points based on percentage of terms matched
      if (matchedTerms > 0) {
        const matchPercentage = matchedTerms / queryTerms.length;
        score += matchPercentage * 4;
      }
    }
    
    return { item, score };
  });
  
  // Add special handling for hash links
  matches.forEach(match => {
    if (match.item.url.includes('#')) {
      // Slightly boost hash links as they're more specific
      match.score += 2;
    }
  });
  
  // Filter out items with zero relevance
  matches = matches.filter(match => match.score > 0);
  
  // Apply category filter if specified
  if (category) {
    matches = matches.filter(match => {
      if (Array.isArray(category)) {
        return category.includes(match.item.category || '');
      }
      return match.item.category === category;
    });
  }
  
  // Sort by relevance score (highest first)
  matches.sort((a, b) => b.score - a.score);
  
  // Get total number of matches before applying limit
  const totalMatches = matches.length;
  
  // Apply limit
  const limitedResults = matches.slice(0, limit).map(match => match.item);
  
  return { 
    results: limitedResults,
    totalMatches
  };
}

/**
 * Get related content based on a SearchItem
 * @param item - The reference SearchItem
 * @param limit - Maximum number of results to return
 * @returns Array of related SearchItems
 */
export function getRelatedContent(item: SearchItem, limit: number = 3): SearchItem[] {
  if (!item) return [];
  
  // Get items in the same category
  const sameCategory = searchIndex
    .filter(i => 
      i.url !== item.url && // Not the same item
      i.category === item.category // Same category
    );
  
  // Find items that share keywords with the reference item
  const byKeywords = searchIndex
    .filter(i => i.url !== item.url) // Not the same item
    .map(i => {
      // Count matching keywords
      const matchingKeywords = i.keywords.filter(k => 
        item.keywords.includes(k)
      ).length;
      
      return { item: i, matches: matchingKeywords };
    })
    .filter(result => result.matches > 0) // Has at least one matching keyword
    .sort((a, b) => b.matches - a.matches); // Sort by most matching keywords
  
  // Combine results, prioritizing same category items
  const combinedResults: SearchItem[] = [];
  
  // Add same category items first
  sameCategory.forEach(catItem => {
    if (combinedResults.length < limit && !combinedResults.includes(catItem)) {
      combinedResults.push(catItem);
    }
  });
  
  // Then add keyword-matching items
  byKeywords.forEach(kwItem => {
    if (combinedResults.length < limit && !combinedResults.includes(kwItem.item)) {
      combinedResults.push(kwItem.item);
    }
  });
  
  return combinedResults.slice(0, limit);
}

/**
 * Get popular search terms based on search index
 * Useful for showing suggested search terms
 * @param limit - Maximum number of terms to return
 * @returns Array of suggested search terms
 */
export function getPopularSearchTerms(limit: number = 5): string[] {
  // This would ideally come from analytics data
  // For now, return common terms from the index
  const allKeywords = searchIndex.flatMap(item => item.keywords);
  
  // Get frequency of each keyword
  const keywordFrequency: {[key: string]: number} = {};
  allKeywords.forEach(keyword => {
    keywordFrequency[keyword] = (keywordFrequency[keyword] || 0) + 1;
  });
  
  // Sort by frequency and take top results
  return Object.entries(keywordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(entry => entry[0]);
}

export default search;
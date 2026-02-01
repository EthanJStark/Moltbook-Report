import type { Post } from '../schema/moltbook.js';

/**
 * Counts how many times keywords appear in post title and content.
 * Case-insensitive matching.
 */
export function countKeywordMatches(post: Post, keywords: Set<string>): number {
  const text = `${post.title} ${post.content}`.toLowerCase();

  let count = 0;
  for (const keyword of keywords) {
    const regex = new RegExp(keyword.toLowerCase(), 'g');
    const matches = text.match(regex);
    if (matches) {
      count += matches.length;
    }
  }

  return count;
}

/**
 * Calculates relevance score combining keyword density and upvotes.
 * Formula: (keywordHits * 10) + (upvotes * 0.5)
 * This weights keyword matches heavily while still considering popularity.
 */
export function calculateRelevanceScore(post: Post, keywords: Set<string>): number {
  const keywordHits = countKeywordMatches(post, keywords);
  const upvotes = post.upvotes || 0;

  return (keywordHits * 10) + (upvotes * 0.5);
}

import { readFile, writeFile } from 'fs/promises';
import type { Post } from '../schema/moltbook.js';
import type { FilteredPost } from '../schema/filtered-post.js';
import type { ThemeName } from '../filter/keywords.js';
import { getKeywordsForTheme } from '../filter/keywords.js';
import { countKeywordMatches, calculateRelevanceScore } from '../filter/matcher.js';

export interface FilterOptions {
  theme: ThemeName;
  input: string;
  output: string;
  limit: number;
  verbose: boolean;
}

export async function filterCommand(options: FilterOptions): Promise<void> {
  const { theme, input, output, limit, verbose } = options;

  if (verbose) {
    console.log(`Filtering posts by theme: ${theme}`);
    console.log(`Reading from: ${input}`);
  }

  // Read input file
  const fileContent = await readFile(input, 'utf-8');
  const data = JSON.parse(fileContent);
  const posts: Post[] = data.posts;

  if (verbose) {
    console.log(`Loaded ${posts.length} posts`);
  }

  // Get keywords for theme
  const keywords = getKeywordsForTheme(theme);

  // Filter posts with at least one keyword match
  const matchingPosts = posts.filter(post => {
    return countKeywordMatches(post, keywords) > 0;
  });

  if (verbose) {
    console.log(`Found ${matchingPosts.length} posts matching theme`);
  }

  // Calculate relevance scores and create FilteredPost objects
  const scoredPosts = matchingPosts.map(post => {
    const keywordHits = countKeywordMatches(post, keywords);
    const score = calculateRelevanceScore(post, keywords);

    const filteredPost: FilteredPost = {
      postId: post.id,
      title: post.title,
      content: post.content,
      author: post.author,
      previouslyCovered: [], // Will be populated by overlap detection
      themeMatch: theme,
      keywordHits,
      upvotes: post.upvotes,
      created_at: post.created_at
    };

    return { post: filteredPost, score };
  });

  // Sort by score (highest first) and take top N
  scoredPosts.sort((a, b) => b.score - a.score);
  const topPosts = scoredPosts.slice(0, limit).map(item => item.post);

  // Write output
  const outputData = {
    theme,
    filtered: topPosts,
    totalMatching: matchingPosts.length,
    returned: topPosts.length
  };

  await writeFile(output, JSON.stringify(outputData, null, 2), 'utf-8');

  if (verbose) {
    console.log(`Saved ${topPosts.length} posts to ${output}`);
  }
}

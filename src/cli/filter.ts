import { readFile, writeFile, readdir } from 'fs/promises';
import { join } from 'path';
import type { Post } from '../schema/moltbook.js';
import type { FilteredPost } from '../schema/filtered-post.js';
import type { ThemeName } from '../filter/keywords.js';
import { getKeywordsForTheme } from '../filter/keywords.js';
import { countKeywordMatches, calculateRelevanceScore } from '../filter/matcher.js';
import { checkOverlap } from '../filter/overlap.js';

export interface FilterOptions {
  theme: ThemeName;
  input: string;
  output: string;
  limit: number;
  verbose: boolean;
}

async function loadCoveredPosts(): Promise<Record<string, number[]>> {
  const coveredPosts: Record<string, number[]> = {};

  try {
    const episodesDirs = await readdir('episodes');

    for (const episodeDir of episodesDirs) {
      const episodeNum = parseInt(episodeDir, 10);
      if (isNaN(episodeNum)) continue;

      const filterFilePath = join('episodes', episodeDir, 'raw', 'filtered-posts.json');

      try {
        const content = await readFile(filterFilePath, 'utf-8');
        const data = JSON.parse(content);

        if (data.filtered && Array.isArray(data.filtered)) {
          for (const post of data.filtered) {
            if (!coveredPosts[post.postId]) {
              coveredPosts[post.postId] = [];
            }
            coveredPosts[post.postId].push(episodeNum);
          }
        }
      } catch (error) {
        // File doesn't exist for this episode, skip
      }
    }
  } catch (error) {
    // episodes directory doesn't exist yet
  }

  return coveredPosts;
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

  // Load covered posts and check overlap
  const coveredPosts = await loadCoveredPosts();
  const postIds = topPosts.map(p => p.postId);
  const overlapResult = checkOverlap(postIds, coveredPosts);

  // Tag posts with previouslyCovered
  for (const post of topPosts) {
    if (coveredPosts[post.postId]) {
      post.previouslyCovered = coveredPosts[post.postId].map(num => String(num).padStart(3, '0'));
    }
  }

  // Display overlap warnings
  if (verbose) {
    if (overlapResult.overlapPercent >= 40) {
      console.error(`ERROR: ${overlapResult.overlapPercent}% overlap detected (threshold: 40%)`);
      console.error('Too much repetition. Consider adjusting filters or limit.');
    } else if (overlapResult.overlapPercent >= 20) {
      console.warn(`Warning: ${overlapResult.overlapPercent}% overlap detected`);
      console.warn('Review overlapping posts to ensure intentional reuse.');
    } else {
      console.log(`✓ Overlap: ${overlapResult.overlapPercent}% (acceptable)`);
    }
  }

  // Write output
  const outputData = {
    theme,
    filtered: topPosts,
    totalMatching: matchingPosts.length,
    returned: topPosts.length,
    overlap: overlapResult
  };

  await writeFile(output, JSON.stringify(outputData, null, 2), 'utf-8');

  if (verbose) {
    console.log(`Saved ${topPosts.length} posts to ${output}`);
  }
}

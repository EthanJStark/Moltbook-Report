// src/scraper/daily.ts
import { MoltbookClient } from '../api/client.js';
import type { Post, PostDetail, Comment } from '../schema/moltbook.js';

export interface ScrapedPost extends Post {
  comments: Comment[];
  source: 'hot' | 'top' | 'both';
}

export function deduplicatePosts(hotPosts: Post[], topPosts: Post[]): Post[] {
  const seen = new Set<string>();
  const result: Post[] = [];

  for (const post of [...hotPosts, ...topPosts]) {
    if (!seen.has(post.id)) {
      seen.add(post.id);
      result.push(post);
    }
  }

  return result;
}

export function flattenComments(comments: Comment[], maxDepth: number, currentDepth = 0): Comment[] {
  if (currentDepth >= maxDepth - 1) {
    return comments.map((c) => ({ ...c, replies: [] }));
  }

  return comments.map((comment) => ({
    ...comment,
    replies: flattenComments(comment.replies, maxDepth, currentDepth + 1),
  }));
}

export interface ScrapeOptions {
  limit: number;
  sort: 'hot' | 'top' | 'both';
  maxComments: number;
  maxDepth: number;
  verbose?: boolean;
}

export async function scrapeDaily(options: ScrapeOptions): Promise<ScrapedPost[]> {
  const client = new MoltbookClient();
  const { limit, sort, maxComments, maxDepth, verbose } = options;

  let posts: Post[] = [];

  if (sort === 'both') {
    if (verbose) console.log('Fetching hot posts...');
    const { posts: hotPosts } = await client.getPosts('hot', limit);
    if (verbose) console.log(`Fetched ${hotPosts.length} hot posts`);

    if (verbose) console.log('Fetching top posts...');
    const { posts: topPosts } = await client.getPosts('top', limit);
    if (verbose) console.log(`Fetched ${topPosts.length} top posts`);

    posts = deduplicatePosts(hotPosts, topPosts);
    if (verbose) console.log(`After deduplication: ${posts.length} unique posts`);
  } else {
    if (verbose) console.log(`Fetching ${sort} posts...`);
    const { posts: fetchedPosts } = await client.getPosts(sort, limit);
    posts = fetchedPosts;
    if (verbose) console.log(`Fetched ${posts.length} posts`);
  }

  const scrapedPosts: ScrapedPost[] = [];

  for (const post of posts) {
    if (verbose) console.log(`Fetching details for: ${post.title.slice(0, 50)}...`);
    try {
      const detail = await client.getPostDetail(post.id);
      const flattenedComments = flattenComments(detail.comments.slice(0, maxComments), maxDepth);

      scrapedPosts.push({
        ...post,
        comments: flattenedComments,
        source: sort === 'both' ? 'both' : sort,
      });
    } catch (error) {
      if (verbose) console.error(`Failed to fetch details for ${post.id}:`, error);
      scrapedPosts.push({ ...post, comments: [], source: sort === 'both' ? 'both' : sort });
    }
  }

  return scrapedPosts;
}

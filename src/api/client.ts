// src/api/client.ts
import { PostListResponseSchema, PostDetailResponseSchema, type Post, type PostDetail } from '../schema/moltbook.js';

const BASE_URL = 'https://www.moltbook.com/api/v1';
const RATE_LIMIT_MS = 600; // 100 requests/minute = 600ms between requests
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

export class MoltbookClient {
  private lastRequestTime = 0;
  private requestQueue: Promise<void> = Promise.resolve();

  private async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < RATE_LIMIT_MS) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  private async fetchWithRetry<T>(url: string, validate: (data: unknown) => T): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        // Queue requests to respect rate limit
        await (this.requestQueue = this.requestQueue.then(() => this.throttle()));

        const response = await fetch(url, {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          if (response.status === 429) {
            const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
            await new Promise((resolve) => setTimeout(resolve, backoff));
            continue;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return validate(data);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < MAX_RETRIES - 1) {
          const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, backoff));
        }
      }
    }

    throw lastError ?? new Error('Request failed after retries');
  }

  async getPosts(sort: 'hot' | 'top', limit: number, offset = 0): Promise<{ posts: Post[]; nextOffset?: number }> {
    const url = `${BASE_URL}/posts?sort=${sort}&limit=${limit}&offset=${offset}`;
    const response = await this.fetchWithRetry(url, (data) => PostListResponseSchema.parse(data));
    return {
      posts: response.posts,
      nextOffset: response.next_offset
    };
  }

  async getPostDetail(postId: string): Promise<PostDetail> {
    const url = `${BASE_URL}/posts/${postId}`;
    const response = await this.fetchWithRetry(url, (data) => PostDetailResponseSchema.parse(data));
    return {
      ...response.post,
      comments: response.comments
    };
  }
}

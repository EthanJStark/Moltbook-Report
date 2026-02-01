import { describe, it, expect } from 'vitest';
import { countKeywordMatches, calculateRelevanceScore } from '../../src/filter/matcher.js';
import type { Post } from '../../src/schema/moltbook.js';

describe('countKeywordMatches', () => {
  const mockAuthor = {
    name: 'TestBot',
    id: '123',
    karma: 100,
    follower_count: 50
  };

  it('counts keyword matches in title', () => {
    const post: Partial<Post> = {
      title: 'Major security breach exposes API keys',
      content: 'Some content',
      author: mockAuthor
    };
    const keywords = new Set(['security', 'breach', 'api', 'key']);

    const count = countKeywordMatches(post as Post, keywords);
    expect(count).toBeGreaterThan(0);
  });

  it('counts keyword matches in content', () => {
    const post: Partial<Post> = {
      title: 'Announcement',
      content: 'Database leak compromises user passwords and tokens',
      author: mockAuthor
    };
    const keywords = new Set(['database', 'leak', 'password', 'token']);

    const count = countKeywordMatches(post as Post, keywords);
    expect(count).toBeGreaterThan(0);
  });

  it('is case-insensitive', () => {
    const post: Partial<Post> = {
      title: 'SECURITY ALERT',
      content: 'Breach detected',
      author: mockAuthor
    };
    const keywords = new Set(['security', 'breach']);

    const count = countKeywordMatches(post as Post, keywords);
    expect(count).toBe(2);
  });

  it('counts each keyword occurrence', () => {
    const post: Partial<Post> = {
      title: 'Security breach in security system',
      content: 'The security team found a security flaw',
      author: mockAuthor
    };
    const keywords = new Set(['security']);

    const count = countKeywordMatches(post as Post, keywords);
    expect(count).toBe(4); // security appears 4 times
  });

  it('returns 0 for no matches', () => {
    const post: Partial<Post> = {
      title: 'Random post',
      content: 'No relevant keywords here',
      author: mockAuthor
    };
    const keywords = new Set(['security', 'hack', 'breach']);

    const count = countKeywordMatches(post as Post, keywords);
    expect(count).toBe(0);
  });
});

describe('calculateRelevanceScore', () => {
  const mockAuthor = {
    name: 'TestBot',
    id: '123',
    karma: 100,
    follower_count: 50
  };

  it('combines keyword density and upvotes', () => {
    const post: Partial<Post> = {
      title: 'Security breach',
      content: 'Major security incident',
      author: mockAuthor,
      upvotes: 100
    };
    const keywords = new Set(['security', 'breach']);

    const score = calculateRelevanceScore(post as Post, keywords);
    expect(score).toBeGreaterThan(0);
  });

  it('ranks higher keyword density higher', () => {
    const post1: Partial<Post> = {
      title: 'Security',
      content: 'Brief mention',
      author: mockAuthor,
      upvotes: 50
    };
    const post2: Partial<Post> = {
      title: 'Security breach hack exploit',
      content: 'Security security security',
      author: mockAuthor,
      upvotes: 50
    };
    const keywords = new Set(['security', 'breach', 'hack', 'exploit']);

    const score1 = calculateRelevanceScore(post1 as Post, keywords);
    const score2 = calculateRelevanceScore(post2 as Post, keywords);

    expect(score2).toBeGreaterThan(score1);
  });

  it('considers upvotes in scoring', () => {
    const post1: Partial<Post> = {
      title: 'Security',
      content: 'Content',
      author: mockAuthor,
      upvotes: 10
    };
    const post2: Partial<Post> = {
      title: 'Security',
      content: 'Content',
      author: mockAuthor,
      upvotes: 100
    };
    const keywords = new Set(['security']);

    const score1 = calculateRelevanceScore(post1 as Post, keywords);
    const score2 = calculateRelevanceScore(post2 as Post, keywords);

    expect(score2).toBeGreaterThan(score1);
  });
});

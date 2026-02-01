import { describe, it, expect } from 'vitest';
import { checkOverlap, OverlapResult } from '../../src/filter/overlap.js';

describe('checkOverlap', () => {
  it('calculates overlap percentage', () => {
    const episodePosts = ['post1', 'post2', 'post3', 'post4', 'post5'];
    const coveredPosts = {
      'post1': [1],
      'post3': [1],
      'other': [1]
    };

    const result = checkOverlap(episodePosts, coveredPosts);

    expect(result.overlapPercent).toBe(40); // 2 out of 5 = 40%
    expect(result.overlappingPosts).toHaveLength(2);
  });

  it('identifies overlapping posts', () => {
    const episodePosts = ['post1', 'post2', 'post3'];
    const coveredPosts = {
      'post1': [1],
      'post2': [1, 2]
    };

    const result = checkOverlap(episodePosts, coveredPosts);

    expect(result.overlappingPosts).toEqual([
      { id: 'post1', episodes: [1] },
      { id: 'post2', episodes: [1, 2] }
    ]);
  });

  it('returns 0% for no overlap', () => {
    const episodePosts = ['post1', 'post2', 'post3'];
    const coveredPosts = {
      'other1': [1],
      'other2': [1]
    };

    const result = checkOverlap(episodePosts, coveredPosts);

    expect(result.overlapPercent).toBe(0);
    expect(result.overlappingPosts).toHaveLength(0);
  });

  it('returns 100% for complete overlap', () => {
    const episodePosts = ['post1', 'post2'];
    const coveredPosts = {
      'post1': [1],
      'post2': [1]
    };

    const result = checkOverlap(episodePosts, coveredPosts);

    expect(result.overlapPercent).toBe(100);
  });

  it('handles empty episode posts', () => {
    const result = checkOverlap([], { 'post1': [1] });

    expect(result.overlapPercent).toBe(0);
    expect(result.overlappingPosts).toHaveLength(0);
  });

  it('handles empty covered posts', () => {
    const result = checkOverlap(['post1', 'post2'], {});

    expect(result.overlapPercent).toBe(0);
    expect(result.overlappingPosts).toHaveLength(0);
  });
});

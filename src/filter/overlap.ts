export interface OverlapResult {
  overlapPercent: number;
  overlappingPosts: Array<{ id: string; episodes: number[] }>;
}

/**
 * Checks overlap between episode posts and previously covered posts.
 * Returns percentage and list of overlapping posts.
 */
export function checkOverlap(
  episodePosts: string[],
  coveredPosts: Record<string, number[]>
): OverlapResult {
  if (episodePosts.length === 0) {
    return {
      overlapPercent: 0,
      overlappingPosts: []
    };
  }

  const overlappingPosts: Array<{ id: string; episodes: number[] }> = [];

  for (const postId of episodePosts) {
    if (coveredPosts[postId]) {
      overlappingPosts.push({
        id: postId,
        episodes: coveredPosts[postId]
      });
    }
  }

  const overlapPercent = Math.round((overlappingPosts.length / episodePosts.length) * 100);

  return {
    overlapPercent,
    overlappingPosts
  };
}

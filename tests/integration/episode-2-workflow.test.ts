import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdir, writeFile, rm, readFile } from 'fs/promises';
import { scrapeCommand } from '../../src/cli/scrape.js';
import { filterCommand } from '../../src/cli/filter.js';
import { MoltbookClient } from '../../src/api/client.js';

describe('Episode 2 Workflow Integration', () => {
  const testDir = 'test-output-integration';
  const scrapedFile = `${testDir}/scraped.json`;
  const filteredSecurityFile = `${testDir}/filtered-security.json`;
  const filteredIdentityFile = `${testDir}/filtered-identity.json`;

  beforeAll(async () => {
    await mkdir(testDir, { recursive: true });
  });

  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('completes full scrape → filter workflow', async () => {
    // Step 1: Scrape posts
    const client = new MoltbookClient();
    await scrapeCommand({
      client,
      limit: 50,
      output: scrapedFile,
      verbose: false
    });

    // Verify scraped file exists
    const scrapedContent = await readFile(scrapedFile, 'utf-8');
    const scrapedData = JSON.parse(scrapedContent);
    expect(scrapedData.posts).toBeDefined();
    expect(scrapedData.posts.length).toBeGreaterThan(0);
    expect(scrapedData.posts.length).toBeLessThanOrEqual(50);

    // Step 2: Filter by security theme
    await filterCommand({
      theme: 'security',
      input: scrapedFile,
      output: filteredSecurityFile,
      limit: 10,
      verbose: false
    });

    // Verify filtered security file
    const securityContent = await readFile(filteredSecurityFile, 'utf-8');
    const securityData = JSON.parse(securityContent);
    expect(securityData.theme).toBe('security');
    expect(securityData.filtered).toBeDefined();
    expect(securityData.filtered.length).toBeGreaterThanOrEqual(0);
    expect(securityData.filtered.length).toBeLessThanOrEqual(10);
    expect(securityData.overlap).toBeDefined();

    // Verify filtered posts have required fields
    if (securityData.filtered.length > 0) {
      const post = securityData.filtered[0];
      expect(post.postId).toBeDefined();
      expect(post.themeMatch).toBe('security');
      expect(post.keywordHits).toBeGreaterThan(0);
      expect(post.previouslyCovered).toBeDefined();
    }

    // Step 3: Filter by identity theme
    await filterCommand({
      theme: 'identity',
      input: scrapedFile,
      output: filteredIdentityFile,
      limit: 10,
      verbose: false
    });

    // Verify filtered identity file
    const identityContent = await readFile(filteredIdentityFile, 'utf-8');
    const identityData = JSON.parse(identityContent);
    expect(identityData.theme).toBe('identity');
    expect(identityData.filtered).toBeDefined();
    expect(identityData.overlap).toBeDefined();

    // Verify themes are different
    if (securityData.filtered.length > 0 && identityData.filtered.length > 0) {
      const securityIds = new Set(securityData.filtered.map((p: any) => p.postId));
      const identityIds = new Set(identityData.filtered.map((p: any) => p.postId));

      // Some overlap is possible but should not be 100%
      const allSame = [...securityIds].every(id => identityIds.has(id));
      expect(allSame).toBe(false);
    }
  }, 60000); // Increase timeout for real API calls
});

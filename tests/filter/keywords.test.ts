import { describe, it, expect } from 'vitest';
import { THEME_KEYWORDS, getKeywordsForTheme } from '../../src/filter/keywords.js';

describe('Theme Keywords', () => {
  it('exports security keywords', () => {
    expect(THEME_KEYWORDS.security).toBeDefined();
    expect(THEME_KEYWORDS.security).toContain('security');
    expect(THEME_KEYWORDS.security).toContain('leak');
    expect(THEME_KEYWORDS.security).toContain('database');
  });

  it('exports identity keywords', () => {
    expect(THEME_KEYWORDS.identity).toBeDefined();
    expect(THEME_KEYWORDS.identity).toContain('human');
    expect(THEME_KEYWORDS.identity).toContain('bot');
    expect(THEME_KEYWORDS.identity).toContain('authentic');
  });

  it('getKeywordsForTheme returns correct set', () => {
    const securityKeys = getKeywordsForTheme('security');
    expect(securityKeys.size).toBeGreaterThan(10);
    expect(securityKeys.has('hack')).toBe(true);

    const identityKeys = getKeywordsForTheme('identity');
    expect(identityKeys.size).toBeGreaterThan(10);
    expect(identityKeys.has('infiltrate')).toBe(true);
  });

  it('throws error for unknown theme', () => {
    expect(() => getKeywordsForTheme('unknown' as any)).toThrow('Unknown theme');
  });
});

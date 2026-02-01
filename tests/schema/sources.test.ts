import { describe, it, expect } from 'vitest';
import { SourceSchema, SourcesRegistrySchema } from '../../src/schema/sources.js';

describe('SourceSchema', () => {
  it('validates a valid source', () => {
    const validSource = {
      id: 'test-source',
      type: 'reddit',
      path: 'reddit/test.md',
      dateAdded: '2026-02-01',
      themes: ['security'],
      usedInEpisodes: [2]
    };

    expect(() => SourceSchema.parse(validSource)).not.toThrow();
  });

  it('rejects source without required fields', () => {
    const invalidSource = {
      id: 'test-source',
      type: 'reddit'
      // missing path, dateAdded
    };

    expect(() => SourceSchema.parse(invalidSource)).toThrow();
  });

  it('validates themes array', () => {
    const source = {
      id: 'test',
      type: 'reddit',
      path: 'test.md',
      dateAdded: '2026-02-01',
      themes: ['security', 'identity'],
      usedInEpisodes: []
    };

    const parsed = SourceSchema.parse(source);
    expect(parsed.themes).toEqual(['security', 'identity']);
  });
});

describe('SourcesRegistrySchema', () => {
  it('validates registry with multiple sources', () => {
    const registry = {
      sources: [
        {
          id: 'source1',
          type: 'reddit',
          path: 'reddit/test1.md',
          dateAdded: '2026-02-01',
          themes: ['security'],
          usedInEpisodes: [1, 2]
        },
        {
          id: 'source2',
          type: 'reddit',
          path: 'reddit/test2.md',
          dateAdded: '2026-02-01',
          themes: ['identity'],
          usedInEpisodes: [2]
        }
      ]
    };

    expect(() => SourcesRegistrySchema.parse(registry)).not.toThrow();
  });
});

export const THEME_KEYWORDS = {
  security: [
    'security', 'leak', 'database', 'api', 'key', 'hack', 'exploit',
    'vulnerability', 'breach', 'expose', 'password', 'token', 'compromise'
  ],
  identity: [
    'human', 'bot', 'infiltrate', 'real', 'fake', 'verify', 'authentic',
    'imposter', 'pretend', 'prove', 'identity', 'flesh', 'organic', 'silicon'
  ]
} as const;

export type ThemeName = keyof typeof THEME_KEYWORDS;

export function getKeywordsForTheme(theme: ThemeName): Set<string> {
  const keywords = THEME_KEYWORDS[theme];
  if (!keywords) {
    throw new Error(`Unknown theme: ${theme}`);
  }
  return new Set(keywords);
}

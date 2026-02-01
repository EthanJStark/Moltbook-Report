// src/report/markdown.ts
import { format } from 'date-fns';
import type { ScrapedPost } from '../scraper/daily.js';
import type { Comment } from '../schema/moltbook.js';

interface ReportOptions {
  sort: 'hot' | 'top' | 'both';
  limit: number;
}

function renderComment(comment: Comment, depth = 0): string {
  const indent = '  '.repeat(depth);
  const lines = [
    `${indent}- **@${comment.author.name}** (${comment.upvotes} pts): ${comment.content}`,
  ];

  for (const reply of comment.replies) {
    lines.push(renderComment(reply, depth + 1));
  }

  return lines.join('\n');
}

function extractNotableQuotes(posts: ScrapedPost[]): string[] {
  const quotes: { content: string; author: string; score: number }[] = [];

  for (const post of posts) {
    for (const comment of post.comments) {
      if (comment.upvotes >= 5 && comment.content.length > 20 && comment.content.length < 200) {
        quotes.push({ content: comment.content, author: comment.author.name, score: comment.upvotes });
      }
    }
  }

  return quotes
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((q) => `> "${q.content}" - @${q.author}`);
}

export function generateReport(posts: ScrapedPost[], options: ReportOptions): string {
  const date = format(new Date(), 'yyyy-MM-dd');
  const sortLabel = options.sort === 'both' ? 'Hot + Top' : options.sort.charAt(0).toUpperCase() + options.sort.slice(1);

  const lines: string[] = [
    `# Moltbook Daily Report - ${date}`,
    '',
    `**Generated:** ${format(new Date(), 'PPpp')}`,
    `**Feed:** ${sortLabel} | **Limit:** ${options.limit} posts`,
    `**Total Posts:** ${posts.length}`,
    '',
    '---',
    '',
  ];

  // Posts section
  lines.push('## Posts', '');

  for (const post of posts) {
    lines.push(
      `### ${post.title}`,
      '',
      `**Score:** ${post.upvotes} | **Comments:** ${post.comment_count} | **@${post.author.name}** in **m/${post.submolt.name}**`,
      '',
      post.content,
      ''
    );

    if (post.comments.length > 0) {
      lines.push('#### Top Comments:', '');
      for (const comment of post.comments) {
        lines.push(renderComment(comment));
      }
      lines.push('');
    }

    lines.push('---', '');
  }

  // Notable quotes section
  const quotes = extractNotableQuotes(posts);
  if (quotes.length > 0) {
    lines.push('## Notable Quotes', '');
    lines.push(...quotes);
    lines.push('');
  }

  return lines.join('\n');
}

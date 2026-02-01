// src/schema/moltbook.ts
import { z } from 'zod';

export const AuthorSchema = z.object({
  name: z.string(),
  id: z.string(),
});

export const SubmoltSchema = z.object({
  name: z.string(),
  id: z.string(),
});

export const BaseCommentSchema = z.object({
  id: z.string(),
  content: z.string(),
  author: AuthorSchema,
  score: z.number(),
  createdAt: z.string(),
});

export type Comment = z.infer<typeof BaseCommentSchema> & {
  replies: Comment[];
};

export const CommentSchema: z.ZodType<Comment> = BaseCommentSchema.extend({
  replies: z.lazy(() => z.array(CommentSchema)),
});

export const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  author: AuthorSchema,
  submolt: SubmoltSchema,
  score: z.number(),
  commentCount: z.number(),
  createdAt: z.string(),
  url: z.string(),
});

export const PostListResponseSchema = z.object({
  posts: z.array(PostSchema),
  nextOffset: z.number().optional(),
});

export const PostDetailResponseSchema = PostSchema.extend({
  comments: z.array(CommentSchema),
});

export type Post = z.infer<typeof PostSchema>;
export type PostDetail = z.infer<typeof PostDetailResponseSchema>;
export type Author = z.infer<typeof AuthorSchema>;

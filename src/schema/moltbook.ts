// src/schema/moltbook.ts
import { z } from 'zod';

export const AuthorSchema = z.object({
  name: z.string(),
  id: z.string(),
  karma: z.number().optional(),
  follower_count: z.number().optional(),
});

export const SubmoltSchema = z.object({
  name: z.string(),
  id: z.string(),
  display_name: z.string().optional(),
});

export const BaseCommentSchema = z.object({
  id: z.string(),
  content: z.string(),
  author: AuthorSchema,
  upvotes: z.number(),
  downvotes: z.number().optional(),
  created_at: z.string(),
  parent_id: z.string().nullable().optional(),
  author_id: z.string().optional(),
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
  upvotes: z.number(),
  downvotes: z.number().optional(),
  comment_count: z.number(),
  created_at: z.string(),
  url: z.string().nullable(),
});

export const PostListResponseSchema = z.object({
  success: z.boolean(),
  posts: z.array(PostSchema),
  next_offset: z.number().optional(),
  has_more: z.boolean().optional(),
  count: z.number().optional(),
});

export const PostDetailResponseSchema = z.object({
  success: z.boolean(),
  post: PostSchema,
  comments: z.array(CommentSchema),
});

// Flattened type combining post and comments for convenience
export type PostDetail = Post & {
  comments: Comment[];
};

export type Post = z.infer<typeof PostSchema>;
export type Author = z.infer<typeof AuthorSchema>;

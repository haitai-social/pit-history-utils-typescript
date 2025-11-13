import { z } from 'zod';

export const ROLE_ENUM = ['user', 'assistant', 'tool'] as const;

export const SingleChatSchema = z.object({
  role: z.enum(ROLE_ENUM).default('user'),
  name: z.string().default(''),
  extra_content: z.string().optional(),
  content: z.string().default(''),
  is_select: z.boolean().default(true),
});

export type SingleChatType = z.infer<typeof SingleChatSchema>;

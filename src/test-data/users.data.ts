import { env } from '@/config/env';
import type { User, UserName } from '@/types/user.types';

function withSharedPassword(username: string): User {
  return { username, password: env.password };
}

export const users = {
  standard_user: withSharedPassword(env.users.standard),
  locked_out_user: withSharedPassword(env.users.lockedOut),
  problem_user: withSharedPassword(env.users.problem),
  performance_glitch_user: withSharedPassword(env.users.performanceGlitch),
  error_user: withSharedPassword(env.users.error),
  visual_user: withSharedPassword(env.users.visual),
} as const satisfies Record<UserName, User>;

export const INVALID_PASSWORD = 'wrong_password';

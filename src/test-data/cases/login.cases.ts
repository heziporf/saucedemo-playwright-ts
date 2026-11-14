import type { LoginErrorKey } from '@/page-objects/pages/login.page';
import { INVALID_PASSWORD, users } from '@/test-data/users.data';
import type { User } from '@/types/user.types';

const standardUser = users.standard_user;

function withCapitalFirstLetter(username: string): string {
  return username.charAt(0).toUpperCase() + username.slice(1);
}

interface LoginErrorCase {
  readonly id: string;
  readonly title: string;
  readonly user: User;
  readonly error: LoginErrorKey;
}

export const loginErrorCases: readonly LoginErrorCase[] = [
  {
    id: 'LOGIN-03',
    title: 'a wrong password is rejected',
    user: { ...standardUser, password: INVALID_PASSWORD },
    error: 'credentialsMismatch',
  },
  {
    id: 'LOGIN-04',
    title: 'the username is case-sensitive',
    user: { ...standardUser, username: withCapitalFirstLetter(standardUser.username) },
    error: 'credentialsMismatch',
  },
  {
    id: 'LOGIN-05',
    title: 'an empty username is required',
    user: { ...standardUser, username: '' },
    error: 'usernameRequired',
  },
  {
    id: 'LOGIN-06',
    title: 'an empty password is required',
    user: { ...standardUser, password: '' },
    error: 'passwordRequired',
  },
];

import client from './client';
import { Token, User } from '../types';

export const login = async (
  email: string,
  password: string,
): Promise<Token> => {
  const form = new URLSearchParams();
  form.append('username', email);
  form.append('password', password);
  const response = await client.post('/users/token', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
};

export const register = async (
  email: string,
  nickname: string,
  password: string,
): Promise<User> => {
  const response = await client.post('/users/', { email, nickname, password });
  return response.data;
};

export const forgotPassword = async (email: string): Promise<void> => {
  await client.post('/users/forgot-password', { email });
};

export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<void> => {
  await client.post('/users/reset-password', {
    token,
    new_password: newPassword,
  });
};

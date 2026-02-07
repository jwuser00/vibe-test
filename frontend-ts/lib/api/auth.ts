import client from "./client";
import { Token, User } from "../types";

export const login = async (
  email: string,
  password: string
): Promise<Token> => {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);
  const response = await client.post("/users/token", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data;
};

export const register = async (
  email: string,
  password: string
): Promise<User> => {
  const response = await client.post("/users/", { email, password });
  return response.data;
};

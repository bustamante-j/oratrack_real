import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address.").trim(),
  password: z.string().min(1, "Password is required."),
});

export const resetPasswordSchema = z.object({
  email: z.email("Enter a valid email address.").trim(),
});

export type FormState = {
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

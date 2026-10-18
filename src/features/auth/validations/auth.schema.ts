import { z } from "zod";

type Translator = (key: string) => string;

/** `t` echoes the key when a message is missing, so fall back to English. */
function pick(t: Translator, key: string, fallback: string): string {
  const value = t(key);
  return value === key ? fallback : value;
}

export const authLoginSchema = (t: Translator) =>
  z.object({
    email: z.email(pick(t, "auth.errorInvalidEmail", "Invalid email address")),
    password: z.string().min(6, pick(t, "auth.errorPasswordMinLength", "Password must be at least 6 characters")),
  });

export type AuthLoginValues = z.infer<ReturnType<typeof authLoginSchema>>;

export const authRegisterSchema = (t: Translator) =>
  z.object({
    name: z.string().min(1, pick(t, "auth.errorNameRequired", "Name is required")),
    email: z.email(pick(t, "auth.errorInvalidEmail", "Invalid email address")),
    password: z.string().min(6, pick(t, "auth.errorPasswordMinLength", "Password must be at least 6 characters")),
    confirmPassword: z.string().min(1, pick(t, "auth.errorConfirmPasswordRequired", "Please confirm your password")),
  }).refine((data) => data.password === data.confirmPassword, {
    message: pick(t, "auth.errorPasswordMismatch", "Passwords do not match"),
    path: ["confirmPassword"],
  });

export type AuthRegisterValues = z.infer<ReturnType<typeof authRegisterSchema>>;

export const authForgotPasswordSchema = (t: Translator) =>
  z.object({
    email: z.email(pick(t, "auth.errorInvalidEmail", "Invalid email address")),
  });

export type AuthForgotPasswordValues = z.infer<ReturnType<typeof authForgotPasswordSchema>>;

export const authResetPasswordSchema = (t: Translator) =>
  z.object({
    password: z.string().min(6, pick(t, "auth.errorPasswordMinLength", "Password must be at least 6 characters")),
    confirmPassword: z.string().min(1, pick(t, "auth.errorConfirmPasswordRequired", "Please confirm your password")),
  }).refine((data) => data.password === data.confirmPassword, {
    message: pick(t, "auth.errorPasswordMismatch", "Passwords do not match"),
    path: ["confirmPassword"],
  });

export type AuthResetPasswordValues = z.infer<ReturnType<typeof authResetPasswordSchema>>;

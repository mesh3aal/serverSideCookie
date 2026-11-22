import { z } from "zod";

export interface UserInfo {
  type: string;
  value: string;
}

export type SignUpState = {
  errors?: {
    username?: string[] | undefined;
    email?: string[] | undefined;
    birthDate?: string[] | undefined;
    password?: string[] | undefined;
    confirmPassword?: string[] | undefined;
  };
  values?: {
    username?: string;
    email?: string;
    birthDate?: string;
  };
  message?: string;
} | null;

// signIn State.
export type SignInState = {
  errors?: {
    email?: string[] | undefined;
    password?: string[] | undefined;
    radio?: boolean | undefined;
  };
  values?: {
    email?: string;
    radio?: boolean;
  };
  message?: string | undefined;
  statusCode: number;
} | null;

export interface BackendState {
  type: string;
  title: string;
  status: number;
  instance: string;
  errors?: {
    [key: string]: string[] | undefined;
  };
}

export const signUpSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be 30 characters or fewer"),
    email: z.email("Please enter a valid email address"),
    birthDate: z.coerce
      .date({ error: "Please enter a valid date of birth" })
      .refine((date) => date <= new Date(), {
        message: "Birth date cannot be in the future",
      })
      .refine(isAtLeast18, {
        message: "You must be at least 18 years old",
      }),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[a-z]/, "Passwords must have at least one lowercase ('a'-'z').")
      .regex(/[A-Z]/, "Passwords must have at least one uppercase ('A'-'Z').")
      .regex(
        /[^a-zA-Z0-9]/,
        "Passwords must have at least one non alphanumeric character.",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .min(1, { error: "email cannot be empty." }),
  password: z.string().min(1, { error: "password cannot be empty either." }),
  rememberMe: z.boolean().default(true),
});

function isAtLeast18(birthDate: Date): boolean {
  let age = new Date().getFullYear() - birthDate.getFullYear();
  const monthDiff = new Date().getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && new Date().getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 18;
}

export type SignUpInputType = z.infer<typeof signUpSchema>;

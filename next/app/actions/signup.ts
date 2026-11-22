"use server";

import z from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  BackendState,
  signInSchema,
  SignInState,
  signUpSchema,
  SignUpState,
} from "../lib/definitions";

export async function SignUp(
  state: SignUpState | undefined,
  formData: FormData,
): Promise<SignUpState> {
  // raw values that extacted from formdata.
  const rawValues = {
    username: String(
      formData.get("username") ?? formData.get("Username") ?? "",
    ),
    email: String(formData.get("email") ?? formData.get("Email") ?? ""),
    birthDate: String(
      formData.get("birthDate") ??
        formData.get("birth") ??
        formData.get("BirthDate") ??
        "",
    ),
    password: String(
      formData.get("password") ?? formData.get("Password") ?? "",
    ),
    confirmPassword: String(
      formData.get("confirmPassword") ?? formData.get("ConfirmPassword") ?? "",
    ),
  };
  const result = signUpSchema.safeParse(rawValues);

  if (!result.success) {
    const tree = z.treeifyError(result.error);
    return {
      errors: {
        username: tree.properties?.username?.errors,
        email: tree.properties?.email?.errors,
        birthDate: tree.properties?.birthDate?.errors,
        password: tree.properties?.password?.errors,
        confirmPassword: tree.properties?.confirmPassword?.errors,
      },
      values: {
        username: rawValues.username,
        email: rawValues.email,
        birthDate: rawValues.birthDate,
      },
    };
  }
  // backend verification.
  try {
    const response = await fetch(process.env.API + "signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Username: rawValues.username,
        Email: rawValues.email,
        BirthDate: rawValues.birthDate,
        Password: rawValues.password,
        ConfirmPassword: rawValues.confirmPassword,
      }),
    });

    // response display
    const data: BackendState = await response.json();


    if (!response.ok) {
      const bErrors = data?.errors || {};
      return {
        message: data?.title || "Registration failed.",
        errors: {
          username:
            bErrors.DuplicateUserName || bErrors.Username || bErrors.username,
          email: bErrors.DuplicateEmail || bErrors.Email || bErrors.email,
          birthDate: bErrors.BirthDate || bErrors.birthDate,
          password: bErrors.Password || bErrors.password,
          confirmPassword: bErrors.ConfirmPassword || bErrors.confirmPassword,
        },
        values: {
          username: rawValues.username,
          email: rawValues.email,
          birthDate: rawValues.birthDate,
        },
      };
    }

    return { message: "Account created successfully." };
  } catch (error) {
    console.log("error: " + error);
    return {
      values: {
        username: rawValues.username,
        email: rawValues.email,
        birthDate: rawValues.birthDate,
      },
    };
  }
}

export async function SignIn(
  initialState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const data = {
    email: String(formData.get("email")) ?? "",
    password: String(formData.get("password")) ?? "",
    rememberMe: Boolean(formData.get("rememberMe")) ?? true,
  };

  const result = signInSchema.safeParse(data);

  if (!result.success) {
    const tree = z.treeifyError(result.error);

    return {
      errors: {
        email: tree.properties?.email?.errors,
        password: tree.properties?.password?.errors,
      },
      values: {
        email: data.email,
        radio: data.rememberMe,
      },
      statusCode: 400,
      message: "please validate the errors and retry again.",
    };
  }
  const response = await fetch(process.env.API + "signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (response.status === 401) {
    return {
      statusCode: 401,
      message: "username or password was incorrect.",
      values: {
        email: data.email,
        radio: data.rememberMe,
      },
    };
  }
  if (!response.ok) {
    return {
      statusCode: 500,
      message:
        "something went wrong please try again later or call the administrators to fix this issue.",
      values: {
        email: data.email,
        radio: data.rememberMe,
      },
    };
  }

  // Forward Set-Cookie headers from ASP.NET to the browser
  const setCookieHeaders = response.headers.getSetCookie();
  if (setCookieHeaders.length > 0) {
    const cookieStore = await cookies();

    for (const rawCookie of setCookieHeaders) {
      const parts = rawCookie.split(";").map((p) => p.trim());
      const [nameValue, ...attributes] = parts;
      const eqIndex = nameValue.indexOf("=");
      const name = nameValue.substring(0, eqIndex);
      const value = nameValue.substring(eqIndex + 1);

      const opts: {
        name: string;
        value: string;
        httpOnly?: boolean;
        secure?: boolean;
        path?: string;
        sameSite?: "lax" | "strict" | "none";
        expires?: Date;
        maxAge?: number;
        domain?: string;
      } = { name, value };

      for (const attr of attributes) {
        const lower = attr.toLowerCase();
        if (lower === "httponly") {
          opts.httpOnly = true;
        } else if (lower === "secure") {
          opts.secure = true;
        } else if (lower.startsWith("path=")) {
          opts.path = attr.split("=")[1];
        } else if (lower.startsWith("samesite=")) {
          opts.sameSite = attr.split("=")[1].toLowerCase() as
            | "lax"
            | "strict"
            | "none";
        } else if (lower.startsWith("expires=")) {
          opts.expires = new Date(attr.substring("expires=".length));
        } else if (lower.startsWith("max-age=")) {
          opts.maxAge = parseInt(attr.split("=")[1], 10);
        } else if (lower.startsWith("domain=")) {
          opts.domain = attr.split("=")[1];
        }
      }

      cookieStore.set(opts);
    }
  }

  revalidatePath("/", "layout");

  return {
    statusCode: 200,
    message: "successfully logged in.",
  };
}

export async function SignOut(): Promise<void> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const response = await fetch(process.env.API + "logout", {
      method: "POST",
      headers: {
        accept: "*/*",
        Cookie: cookieHeader,
      },
    });

    const setCookieHeaders = response.headers.getSetCookie();
    if (setCookieHeaders.length > 0) {
      for (const rawCookie of setCookieHeaders) {
        const parts = rawCookie.split(";").map((p) => p.trim());
        const [nameValue, ...attributes] = parts;
        const eqIndex = nameValue.indexOf("=");
        const name = nameValue.substring(0, eqIndex);
        const value = nameValue.substring(eqIndex + 1);

        const opts: {
          name: string;
          value: string;
          httpOnly?: boolean;
          secure?: boolean;
          path?: string;
          sameSite?: "lax" | "strict" | "none";
          expires?: Date;
          maxAge?: number;
          domain?: string;
        } = { name, value };

        for (const attr of attributes) {
          const lower = attr.toLowerCase();
          if (lower === "httponly") {
            opts.httpOnly = true;
          } else if (lower === "secure") {
            opts.secure = true;
          } else if (lower.startsWith("path=")) {
            opts.path = attr.split("=")[1];
          } else if (lower.startsWith("samesite=")) {
            opts.sameSite = attr.split("=")[1].toLowerCase() as
              | "lax"
              | "strict"
              | "none";
          } else if (lower.startsWith("expires=")) {
            opts.expires = new Date(attr.substring("expires=".length));
          } else if (lower.startsWith("max-age=")) {
            opts.maxAge = parseInt(attr.split("=")[1], 10);
          } else if (lower.startsWith("domain=")) {
            opts.domain = attr.split("=")[1];
          }
        }

        cookieStore.set(opts);
      }
    }
  } catch (error) {
    console.error("Backend logout error:", error);
  }

  // Clear all cookies in the Next.js cookie store
  for (const cookie of cookieStore.getAll()) {
    cookieStore.delete(cookie.name);
  }

  revalidatePath("/", "layout");
}

export const Signout = SignOut;


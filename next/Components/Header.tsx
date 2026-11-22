"use client";
import { SignIn, SignUp, SignOut } from "@/app/actions/signup";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { LuX } from "react-icons/lu";
import { useGetUser } from "../app/hooks/useGetUser";

type AuthMode = "signin" | "signup";

export type SignUpActionState = {
  errors?: {
    Username?: string[];
    email?: string[];
    birth?: string[];
    password?: string[];
    ConfirmPassword?: string[];
  };
  values?: {
    Username?: string;
    email?: string;
    birth?: string;
  };
  message?: string;
} | null;

const Header = () => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [mode, setMode] = useState<AuthMode>();
  const [isLoggingOut, startTransition] = useTransition();

  const { name, email } = useGetUser();

  function openDialog(nextMode: AuthMode) {
    setMode(nextMode);
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function handleLogout() {
    startTransition(async () => {
      await SignOut();
    });
  }

  const [signUpState, signUpAction, isSignUpPending] = useActionState<
    SignUpActionState,
    FormData
  >(SignUp, null);

  const [signInState, signInAction, isSignInPending] = useActionState(
    SignIn,
    null,
  );

  useEffect(() => {
    if (signInState?.statusCode === 200) {
      closeDialog();
    }
  }, [signInState]);

  const isSignIn = mode === "signin";

  return (
    <>
      <header className="w-full bg-white px-2 py-4 border-b border-gray-200">
        <div className="container mx-auto grid grid-cols-3 items-center">
          <div>
            <p className="text-2xl text-orange-600 uppercase font-bold">LOGO</p>
          </div>
          <nav className="flex justify-center">
            <menu className="flex gap-8 items-center">
              <li>
                <a href="#" className="hover:text-red-500 transition-colors">
                  HOME
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500 transition-colors">
                  SHOP
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-500 transition-colors">
                  ABOUT
                </a>
              </li>
            </menu>
          </nav>

          {name ? (
            <div className="flex space-x-4 justify-end items-center text-sm">
              <p className="text-gray-400">Welcome {name.toUpperCase()}</p>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-6 py-2 text-xs bg-black text-white rounded-xl disabled:opacity-50 transition-opacity"
              >
                {isLoggingOut ? "LOGGING OUT..." : "LOGOUT"}
              </button>
            </div>
          ) : (
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => openDialog("signin")}
                className="px-4 py-2 bg-black text-white rounded-lg"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => openDialog("signup")}
                className="px-4 py-2 bg-black text-white rounded-lg"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      <dialog
        className="m-auto rounded-2xl overflow-hidden backdrop:bg-black/85"
        ref={dialogRef}
      >
        <div className="flex flex-col justify-center items-center p-4 bg-white shadow-md min-w-96">
          <div className="w-full flex justify-center relative">
            <p className="text-xl font-medium text-gray-800 mb-1">
              {isSignIn ? "Sign In" : "Sign Up"}
            </p>
            <button
              type="button"
              className="absolute top-0 right-0"
              onClick={closeDialog}
            >
              <LuX
                className="bg-gray-800 text-white rounded-full p-0.5 hover:bg-black"
                size={21}
              />
            </button>
          </div>

          <p className="text-sm font-light text-gray-400">
            {isSignIn
              ? "Put your credentials to access your account down below."
              : "Put your information down below to complete your registration."}
          </p>

          {isSignIn ? (
            <form className="w-full" action={signInAction}>
              <div className="my-4">
                <label htmlFor="email" className="text-start block">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-gray-600 outline-none"
                />
              </div>
              {signInState?.errors?.email?.map((error, i) => (
                <p key={i} className="text-red-600">
                  {error}
                </p>
              ))}
              <div className="my-4">
                <label htmlFor="password" className="text-start block">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-gray-600 outline-none"
                />
              </div>
              {signInState?.errors?.password?.map((error, i) => (
                <p key={i} className="text-red-600">
                  {error}
                </p>
              ))}
              <div className="flex gap-x-1">
                <input
                  id="radio"
                  name="rememberMe"
                  type="checkbox"
                  defaultChecked={true}
                  required
                />
                <label htmlFor="radio" className="text-start block">
                  Remember Me
                </label>
              </div>
              <button
                type="submit"
                disabled={isSignInPending}
                className={`px-8 py-2 ${isSignInPending ? "bg-gray-700" : "bg-black"} text-white rounded-xl mx-auto block mt-8`}
              >
                {isSignInPending ? "Loading..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form className="w-full" action={signUpAction}>
              <div className="my-4">
                <label htmlFor="Username" className="text-start block">
                  Username
                </label>
                <input
                  id="Username"
                  name="Username"
                  type="text"
                  defaultValue={signUpState?.values?.Username ?? ""}
                  required
                  className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-gray-600 outline-none"
                />
                {signUpState?.errors?.Username?.map((err, i) => (
                  <p key={i} className="text-sm text-red-600 mt-1">
                    {err}
                  </p>
                ))}
              </div>
              <div className="my-4">
                <label htmlFor="email" className="text-start block">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={signUpState?.values?.email ?? ""}
                  required
                  className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-gray-600 outline-none"
                />
                {signUpState?.errors?.email?.map((err, i) => (
                  <p key={i} className="text-sm text-red-600 mt-1">
                    {err}
                  </p>
                ))}
              </div>
              <div className="my-4">
                <label htmlFor="birth" className="text-start block">
                  Date of Birth
                </label>
                <input
                  id="birth"
                  name="birth"
                  type="date"
                  defaultValue={signUpState?.values?.birth ?? ""}
                  required
                  className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-gray-600 outline-none"
                />
                {signUpState?.errors?.birth?.[0] && (
                  <p className="text-sm text-red-600 mt-1">
                    {signUpState.errors.birth[0]}
                  </p>
                )}
              </div>
              <div className="my-4">
                <label htmlFor="password" className="text-start block">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-gray-600 outline-none"
                />
                {signUpState?.errors?.password?.map((err, i) => (
                  <p key={i} className="text-sm text-red-600 mt-1">
                    {err}
                  </p>
                ))}
              </div>
              <div className="my-4">
                <label htmlFor="ConfirmPassword" className="text-start block">
                  Confirm Password
                </label>
                <input
                  id="ConfirmPassword"
                  name="ConfirmPassword"
                  type="password"
                  required
                  className="w-full border border-gray-300 rounded-md px-2 py-1 focus:border-gray-600 outline-none"
                />
                {signUpState?.errors?.ConfirmPassword?.[0] && (
                  <p className="text-sm text-red-600 mt-1">
                    {signUpState.errors.ConfirmPassword[0]}
                  </p>
                )}
              </div>

              {signUpState?.message && (
                <p className="text-sm text-green-700 mt-2">
                  {signUpState.message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSignUpPending}
                className={`px-8 py-2 ${isSignUpPending ? "bg-gray-700" : "bg-black"} text-white rounded-xl mx-auto block mt-8`}
              >
                {isSignUpPending ? "Loading..." : "Sign Up"}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
};

export default Header;

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowRight, Leaf } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/lib/hooks/use-auth";

const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Please enter your username.")
    .max(50, "Username must be 50 characters or fewer."),
  password: z
    .string()
    .min(1, "Please enter your password.")
    .max(100, "Password must be 100 characters or fewer."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const getLoginErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 400 || error.response?.status === 401) {
      return "Invalid username or password. Please try the demo account.";
    }

    if (error.code === "ERR_NETWORK") {
      return "Network request failed. Please check your connection and try again.";
    }
  }

  return "Sign in failed. Please try again in a moment.";
};

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, initialized, isLoading, login } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (initialized && isAuthenticated) {
      router.replace("/todos");
    }
  }, [initialized, isAuthenticated, router]);

  const onSubmit = useCallback(
    async (values: LoginFormValues) => {
      setSubmitError(null);

      try {
        await login(values);
        router.replace("/todos");
      } catch (error) {
        setSubmitError(getLoginErrorMessage(error));
      }
    },
    [login, router],
  );

  const isBusy = isSubmitting || isLoading;

  return (
    <main
      id="main-content"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8"
    >
      <div
        aria-hidden="true"
        className="organic-blob -top-20 -left-16 h-80 w-80 bg-primary/55"
        style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
      />
      <div
        aria-hidden="true"
        className="organic-blob -right-20 top-20 h-96 w-96 bg-secondary/40"
        style={{ borderRadius: "74% 26% 55% 45% / 35% 58% 42% 65%" }}
      />

      <section className="relative w-full max-w-xl space-y-5">
        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="organic-card organic-card-main p-8 sm:p-10"
          aria-label="Sign in form"
        >
          <h1 className="text-center text-4xl font-semibold text-foreground sm:text-5xl">
            Sign In
          </h1>
          <p className="mt-4 text-center text-muted-foreground">
            Use your credentials to enter your task garden.
          </p>

          <div className="mt-8 space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-semibold text-accent-foreground">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                spellCheck={false}
                placeholder="emilys…"
                className="organic-pill-input w-full text-base text-foreground placeholder:text-muted-foreground"
                aria-invalid={errors.username ? true : false}
                aria-describedby={errors.username ? "username-error" : undefined}
                {...register("username")}
              />
              {errors.username ? (
                <p id="username-error" className="text-sm text-destructive">
                  {errors.username.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-accent-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="emilyspass…"
                className="organic-pill-input w-full text-base text-foreground placeholder:text-muted-foreground"
                aria-invalid={errors.password ? true : false}
                aria-describedby={errors.password ? "password-error" : undefined}
                {...register("password")}
              />
              {errors.password ? (
                <p id="password-error" className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isBusy}
              className="organic-button inline-flex h-12 w-full items-center justify-center gap-2 px-8 text-base font-bold"
            >
              {isBusy ? (
                "Signing In…"
              ) : (
                <>
                  Enter Workspace
                  <ArrowRight size={18} aria-hidden="true" />
                </>
              )}
            </button>

            <p role="alert" aria-live="polite" className="min-h-6 text-sm text-destructive">
              {submitError ? submitError : ""}
            </p>
          </div>
        </form>

        <aside className="organic-card organic-card-soft p-5 sm:p-6">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
            <Leaf size={14} aria-hidden="true" />
            Demo Account
          </p>
          <dl className="mt-3 space-y-2 text-base text-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <dt className="text-muted-foreground">Username</dt>
              <dd className="font-semibold">emilys</dd>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <dt className="text-muted-foreground">Password</dt>
              <dd className="font-semibold">emilyspass</dd>
            </div>
          </dl>
        </aside>
      </section>
    </main>
  );
}

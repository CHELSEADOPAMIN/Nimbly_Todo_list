"use client";

import { use } from "react";
import { AuthContext } from "@/lib/providers/auth-provider";

export const useAuth = () => {
  const context = use(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return {
    user: context.state.user,
    isLoading: context.state.isLoading,
    isAuthenticated: context.state.isAuthenticated,
    initialized: context.meta.initialized,
    login: context.actions.login,
    logout: context.actions.logout,
  };
};

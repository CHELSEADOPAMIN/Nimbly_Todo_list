"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/providers/auth-provider";

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return <AuthProvider>{children}</AuthProvider>;
};

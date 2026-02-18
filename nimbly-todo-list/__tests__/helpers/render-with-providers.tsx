import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { AuthProvider } from "@/lib/providers/auth-provider";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface ProviderOptions extends Omit<RenderOptions, "wrapper"> {
  withAuth?: boolean;
  queryClient?: QueryClient;
}

export const renderWithProviders = (
  ui: ReactElement,
  options: ProviderOptions = {},
) => {
  const { withAuth = true, queryClient = createTestQueryClient(), ...renderOptions } =
    options;

  const Wrapper = ({ children }: { children: ReactNode }) => {
    const tree = (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    if (!withAuth) {
      return tree;
    }

    return <AuthProvider>{tree}</AuthProvider>;
  };

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
};

import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/app/providers";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nimbly Todo List",
  description: "Organic and natural todo workspace with authentication",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${nunito.variable}`}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
        <Toaster
          richColors
          position="top-right"
          visibleToasts={4}
          toastOptions={{
            classNames: {
              toast:
                "!rounded-[1.2rem] !border !border-[rgb(222_216_207_/_0.72)] !bg-[#fefefa] !text-foreground !shadow-[0_8px_24px_-4px_rgba(93,112,82,0.18),0_16px_32px_-12px_rgba(193,140,93,0.2)]",
              title: "!font-semibold !text-foreground",
              description: "!text-[var(--muted-foreground)]",
              actionButton:
                "!rounded-full !bg-[var(--primary)] !text-[var(--primary-foreground)]",
              cancelButton:
                "!rounded-full !bg-[var(--muted)] !text-[var(--accent-foreground)]",
              closeButton:
                "!rounded-full !border-[var(--border)] !bg-white !text-[var(--muted-foreground)]",
            },
          }}
        />
      </body>
    </html>
  );
}

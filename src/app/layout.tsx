import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ORATRACK | Balili Elementary School",
    template: "%s | ORATRACK",
  },
  description:
    "ORATRACK is Balili Elementary School's learner monitoring and school administration platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-950">
        {children}
      </body>
    </html>
  );
}

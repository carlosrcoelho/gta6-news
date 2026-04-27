import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GTA VI Daily Report",
  description: "Daily news, leaks, and rumors about Grand Theft Auto VI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ backgroundColor: "#0a0a0f" }}>
        <header style={{ backgroundColor: "#0d0d14", borderBottom: "1px solid #1e1e2e" }}>
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
            <a href="/" className="flex items-center gap-3 no-underline">
              <span className="text-2xl font-black tracking-tight" style={{ color: "#f5c518" }}>
                GTA VI
              </span>
              <span className="text-sm font-medium uppercase tracking-widest" style={{ color: "#6b7280" }}>
                Daily Report
              </span>
            </a>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
        <Analytics />
        <footer
          className="max-w-4xl mx-auto px-4 py-6 text-center text-sm"
          style={{ color: "#4b5563", borderTop: "1px solid #1e1e2e" }}
        >
          GTA VI Daily Report — Unofficial fan news site. Not affiliated with Rockstar Games or Take-Two Interactive.
        </footer>
      </body>
    </html>
  );
}

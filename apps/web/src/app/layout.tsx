// apps/web/src/app/layout.tsx
import "./styles/globals.css";
import { Lexend } from "next/font/google";
import { Toaster } from "sonner"; // 🚀 Step 1: Import Sonner

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-lexend",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={lexend.variable}>
      <body className="font-sans antialiased min-h-dvh">
        {children}

        {/* 🚀 Step 2: Global Notification Provider */}
        <Toaster
          position="top-center" // Matches your balanced 3-column UI
          expand={false}
          richColors
          closeButton
          toastOptions={{
            style: {
              background: "var(--surface-strong, #1a1a1a)", // Fallback to dark if var missing
              border: "1px solid var(--line, #333)",
              color: "var(--ink, #fff)",
              borderRadius: "var(--xotic-radius, 12px)",
              fontFamily: "var(--font-lexend)",
              marginTop: "1.5rem", // Clears your top breadcrumb bar
            },
          }}
        />
      </body>
    </html>
  );
}

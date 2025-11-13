import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import { GlobalToaster } from "@/components/Toaster";
import Script from "next/script";
import ClientAnalytics from "@/components/ClientAnalytics";

export const metadata = {
  title: "Lotto",
  icons: "/logo.png",
  description: "Your lucky draw platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-white">
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}

        <Providers>
          <Navbar />
          <ClientAnalytics />
          {children}
          <GlobalToaster />
        </Providers>
      </body>
    </html>
  );
}

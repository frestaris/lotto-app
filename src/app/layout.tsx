import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import { GlobalToaster } from "@/components/Toaster";

export const metadata = {
  title: "Lotto App",
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
        <Providers>
          <Navbar />
          {children}
          <GlobalToaster />
        </Providers>
      </body>
    </html>
  );
}

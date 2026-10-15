import type { Metadata, Viewport } from "next";
import { Open_Sans, Poppins } from "next/font/google";
import "./admin.css";

// Same fonts as the Coffee Wagera admin: Poppins headings, Open Sans body.
const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-poppins" });
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans" });

export const metadata: Metadata = {
  title: "IBAGRADS Admissions – Admin",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

// Own root layout (route group), so the WhatsApp CSS from the chat never loads here.
export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} ${openSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}

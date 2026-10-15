import type { Metadata, Viewport } from "next";
import "./pay.css";

export const metadata: Metadata = {
  title: "IBAGRADS Pay (Demo)",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

// Own root layout (route group), so the WhatsApp CSS from the chat never loads here.
export default function PayLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

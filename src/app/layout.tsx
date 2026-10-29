import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { tenant } from "@/lib/tenant";
import "./globals.css";

// Archivo's width axis lets headings run wide like the heavy-engineering
// signage this is built for, while body text stays at normal width.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: `${tenant.product} for ${tenant.name}`,
  description: "Live digital twin and operations view for manufacturing plants.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}

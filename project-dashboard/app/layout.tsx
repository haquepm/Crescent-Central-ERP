import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Crescent | Project Intelligence",
  description: "Crescent Contractors project performance dashboard",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
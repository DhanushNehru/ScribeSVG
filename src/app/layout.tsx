import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScribeSVG - Premium Typing SVG Generator for GitHub READMEs",
  description: "Generate animated typing SVGs for your GitHub profile README, repositories, or websites. Support for terminal frames, linear gradients, neon glows, and custom fonts.",
  keywords: ["GitHub Profile", "README SVG", "Typing Animation", "Open Source", "Developer Portfolio", "SVG Generator"],
  authors: [{ name: "Dhanush Nehru", url: "https://github.com/dhanushnehru" }]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

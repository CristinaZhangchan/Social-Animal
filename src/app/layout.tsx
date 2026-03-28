import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SocialAnimal - AI-Powered Social Practice",
  description:
    "Master social skills through immersive AI conversations. Practice interviews, networking, and more with realistic avatar interactions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

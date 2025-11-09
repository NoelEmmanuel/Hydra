import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "HYDRA",
  description: "Build sophisticated multi-agent reasoning systems powered by NVIDIA Nemotron",
  icons: {
    icon: "/logo.png",
  },
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


import type { Metadata } from "next";
import { Poppins, Space_Grotesk } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
// Fonte do wordmark: os títulos do produto seguem a mesma voz do logo.
const poppins = Poppins({
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  // Base absoluta para Open Graph/Twitter (issue #22): sem metadataBase o Next
  // não consegue montar og:image absoluto e o preview do WhatsApp quebra.
  metadataBase: new URL(siteUrl()),
  title: "PressLink | Seu som, sua presença",
  description: "Crie um portfólio profissional para sua carreira como DJ.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${spaceGrotesk.variable} ${poppins.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

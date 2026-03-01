import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

import { createClient } from "@/lib/supabase/static";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://osim.example.com";

export async function generateMetadata() {
  const supabase = createClient();
  const { data: settings } = await supabase
    .from("pengaturan")
    .select("nama_organisasi, deskripsi_singkat")
    .eq("id", 1)
    .single();

  const siteName =
    settings?.nama_organisasi || "OSIM - Website Resmi Organisasi Siswa";
  const siteDescription =
    settings?.deskripsi_singkat ||
    "Website resmi OSIM SMA Negeri Model. Informasi seputar kegiatan, program kerja, dan keanggotaan organisasi siswa.";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteName,
      template: `%s | ${siteName.split(" - ")[0]}`,
    },
    description: siteDescription,
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: siteUrl,
      siteName: siteName,
      title: siteName,
      description: siteDescription,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: siteDescription,
      images: ["/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning className={outfit.variable}>
      <body className="antialiased font-sans bg-bg-page text-text-body">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}

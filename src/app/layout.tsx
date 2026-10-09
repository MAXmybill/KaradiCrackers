import type { Metadata } from 'next';
import { Lilita_One, Poppins } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingCart from '@/components/FloatingCart';
import { Toaster } from 'sonner';

const lilita = Lilita_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-lilita',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Karadi Crackers - Light up your Diwali! | Sivakasi Quality Fireworks',
  description:
    'Shop authentic Sivakasi Diwali crackers at Karadi Crackers. Browse sparklers, rockets, sky shots, flower pots and book your counter pickup invoice online today.',
  keywords: 'Karadi Crackers, Diwali Crackers, Sivakasi fireworks, buy crackers online, Diwali 2026',
  openGraph: {
    title: 'Karadi Crackers - Light up your Diwali!',
    description: 'Direct factory rates on Diwali crackers. Book online, pay and collect at counter.',
    images: ['/logo.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lilita.variable} ${poppins.variable}`}>
      <body className="font-[family-name:var(--font-poppins)] bg-[#FFFFFF] text-gray-900 min-h-screen flex flex-col antialiased selection:bg-[#FFC400] selection:text-[#D40000]">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <FloatingCart />
        <Toaster richColors position="bottom-right" offset="80px" />
      </body>
    </html>
  );
}

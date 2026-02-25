import type { Metadata, Viewport } from 'next';
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';
import '@/styles/globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F0E8' },
    { media: '(prefers-color-scheme: dark)', color: '#1B3A2D' },
  ],
};

export const metadata: Metadata = {
  title: 'LinkUp Golf - Find Your Foursome',
  description:
    'Premium golf tee time discovery platform where professionals connect by industry to find golf partners.',
  keywords: ['golf', 'tee times', 'networking', 'professionals', 'golf partners'],
  authors: [{ name: 'LinkUp Golf' }],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LinkUp Golf',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'LinkUp Golf - Find Your Foursome',
    description:
      'Premium golf tee time discovery platform where professionals connect by industry to find golf partners.',
    type: 'website',
    locale: 'en_US',
    siteName: 'LinkUp Golf',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LinkUp Golf - Find Your Foursome',
    description:
      'Premium golf tee time discovery platform where professionals connect by industry to find golf partners.',
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${jetbrains.variable}`}
    >
      <head>
        {/* Leaflet CSS - load early to prevent map styling issues */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
          integrity="sha512-h9FcoyWjHcOcmEVkxOfTLnmZFWIH0iZhZT1H2TbOq55xssQGEJHEaIm+PgoUaZbRvQTNTluNOEfb1ZRy6D3BOw=="
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-secondary text-text antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

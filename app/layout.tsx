import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import "./globals.css";
import AuthProvider from './AuthProvider';
import { MusicProvider } from '../components/MusicProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Old Maid - Tomodachi',
  description: 'A game of wits and deception.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className + " casino-carpet-bg min-h-screen relative"}>
        <div className="vignette" />
        <MusicProvider>
          <AuthProvider>
            <main>
              {children}
            </main>
          </AuthProvider>
        </MusicProvider>
      </body>
    </html>
  );
}
import type { Metadata } from 'next';
import { JetBrains_Mono, Public_Sans } from 'next/font/google';
import { SITE } from '@/content/site';
import { defaultRole } from '@/content/roles';
import { surfaceMetadata } from '@/lib/metadata';
import './globals.css';

/*
 * The export loaded these from a Google Fonts <link>, which is a render-blocking
 * third-party stylesheet. `next/font` self-hosts them and inlines the face
 * declarations, so there is no extra connection and no swap-induced layout shift.
 * The pairing itself is unchanged; it is doing real work in this design.
 */
const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-public-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  /*
   * The canonical origin, which this file used to say did not exist.
   *
   * Without it Next emits relative Open Graph URLs and a relative sitemap `<loc>`, and
   * the sitemap protocol requires absolute ones. The origin has been established for a
   * while (the résumé PDFs print it in their footer) so the comment claiming
   * otherwise was outliving the fact.
   */
  metadataBase: new URL(SITE.origin),
  ...surfaceMetadata(defaultRole, '/'),
  title: {
    default: defaultRole.metaTitle,
    template: '%s; Prove It Resume',
  },
  applicationName: 'Prove It Resume',
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${publicSans.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

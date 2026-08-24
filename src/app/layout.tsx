import type { Metadata } from 'next';
import { JetBrains_Mono, Public_Sans } from 'next/font/google';
import { SITE } from '@/content/site';
import { defaultRole } from '@/content/roles';
import './globals.css';

/*
 * The export loaded these from a Google Fonts <link>, which is a render-blocking
 * third-party stylesheet. `next/font` self-hosts them and inlines the face
 * declarations, so there is no extra connection and no swap-induced layout shift.
 * The pairing itself is unchanged — it is doing real work in this design.
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
  title: {
    default: defaultRole.metaTitle,
    template: '%s — Prove It Resume',
  },
  description: defaultRole.metaDescription,
  applicationName: 'Prove It Resume',
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  // No verified canonical origin was supplied, so no metadataBase, no absolute URLs,
  // and no social-profile metadata. See docs/content-audit.md.
  openGraph: {
    type: 'profile',
    title: defaultRole.metaTitle,
    description: defaultRole.metaDescription,
    siteName: 'Prove It Resume',
  },
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

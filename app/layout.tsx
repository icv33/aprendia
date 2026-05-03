import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import { Providers } from '@/components/Providers'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AprendIA — Automatiza tu vida con Inteligencia Artificial',
  description: 'Aprende a usar la IA para ahorrar tiempo, automatizar tareas y generar ingresos. Guías prácticas sin necesidad de programar.',
  openGraph: {
    title: 'AprendIA',
    description: 'Automatiza tu vida con Inteligencia Artificial',
    url: 'https://aprendia.store',
    siteName: 'AprendIA',
    locale: 'es_ES',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`${syne.variable} ${dmSans.variable}`}>
      <body className="min-h-full bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

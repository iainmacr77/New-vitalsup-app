import type { Metadata } from 'next'
import './globals.css'
import AppShellWrapper from '@/components/base44/AppShellWrapper'

export const metadata: Metadata = {
  title: 'VitalsUp',
  description: 'Patient Engagement & Practice Intelligence for Doctors',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { 
        rel: 'icon', 
        url: '/vitals-icon-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      { 
        rel: 'icon', 
        url: '/vitals-icon-512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  },
  themeColor: '#ffffff',
  viewport: 'width=device-width, initial-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VitalsUp'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AppShellWrapper>
          {children}
        </AppShellWrapper>
      </body>
    </html>
  )
}

'use client'
import AppShell from '@/components/AppShell'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export interface User {
  id: string
  username: string
  role: 'admin' | 'sales' | 'viewer'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
      <meta name="google" content="notranslate" />
      <body className={inter.className}>
      <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}

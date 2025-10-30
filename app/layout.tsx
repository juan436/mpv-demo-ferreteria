/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ToastContainer } from "@/components/notifications/toast-container"
import { PWAInstaller } from "@/components/pwa/pwa-installer"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { IndexedDBProvider } from "@/components/providers/indexeddb-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Ferreteria - Gestión de Pedidos",
  description: "Sistema de gestión de pedidos para ferretería",
  generator: "v0.app",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/favicon.ico" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ferreteria",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1e3a8a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <IndexedDBProvider>
          <PWAInstaller />
          <InstallPrompt />
          <Suspense fallback={null}>{children}</Suspense>
          <ToastContainer />
          <Analytics />
        </IndexedDBProvider>
      </body>
    </html>
  )
}

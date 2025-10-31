import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { TokenRefreshHandler } from "@/components/token-refresh-handler"
import { UnifiedHeader } from "@/components/unified-header"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AdVouch - Connect Businesses and Advertisers",
  description: "The complete platform to create, discover, and promote ads",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans antialiased`}>
        <UnifiedHeader />
        {children}
        <TokenRefreshHandler />
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wayvian - Your Career Navigator',
  description: 'Empowering students, graduates, and career changers with personalized guidance based on real job market trends',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

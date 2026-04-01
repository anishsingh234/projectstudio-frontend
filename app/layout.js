import './globals.css'
import Navbar from '@/component/Navbar'

export const metadata = {
  title: 'AI Project Assistant',
  description: 'Manage projects with Gemini AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0f0f0f] min-h-screen">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </div>
      </body>
    </html>
  )
}
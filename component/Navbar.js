import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="w-full bg-[#1a1a1a] border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold text-white">
        🤖 AI Assistant
      </Link>
      <Link href="/projects">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white transition">
          My Projects
        </button>
      </Link>
    </nav>
  )
}
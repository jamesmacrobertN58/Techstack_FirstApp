import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  // If user is already logged in, redirect to dashboard
  const { userId } = await auth()
  if (userId) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4aa] to-[#7c3aed] flex items-center justify-center text-white font-bold text-lg">
            N
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">Nineteen58</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Glowing orb effect */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#7c3aed]/20 blur-[120px] -z-10" />
        
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00d4aa] to-[#7c3aed] flex items-center justify-center mb-8 shadow-2xl shadow-[#7c3aed]/30">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
          Nineteen58 <span className="text-[#00d4aa]">AI Agent</span>
        </h1>
        
        {/* Subheading */}
        <p className="text-xl text-[#6b7280] max-w-lg mb-12">
          Your personal AI assistant. Manage tasks, set reminders, and schedule events with natural language.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/sign-in"
            className="px-8 py-4 bg-[#00d4aa] text-black font-semibold rounded-xl hover:bg-[#00b894] transition-all hover:scale-105 text-lg"
          >
            Sign In
          </Link>
          <Link 
            href="/sign-up"
            className="px-8 py-4 bg-[#1e1e26] border border-[#2a2a35] text-white font-semibold rounded-xl hover:bg-[#2a2a35] transition-all hover:scale-105 text-lg"
          >
            Create Account
          </Link>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <div className="p-6 rounded-2xl bg-[#16161d]/50 border border-[#2a2a35]">
            <div className="w-12 h-12 rounded-xl bg-[#00d4aa]/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#00d4aa]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Smart Tasks</h3>
            <p className="text-[#6b7280] text-sm">Add tasks with natural language. Just say what you need to do.</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-[#16161d]/50 border border-[#2a2a35]">
            <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Timed Reminders</h3>
            <p className="text-[#6b7280] text-sm">Set reminders that sync with your Google Calendar.</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-[#16161d]/50 border border-[#2a2a35]">
            <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#7c3aed]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">AI Powered</h3>
            <p className="text-[#6b7280] text-sm">Chat with your AI assistant to manage everything.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-[#6b7280] text-sm">
        © 2026 Nineteen58. Built with Next.js, Clerk, Supabase & OpenAI.
      </footer>
    </div>
  )
}
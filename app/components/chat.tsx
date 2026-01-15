'use client'

import { useChat } from 'ai/react'

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()

  return (
    <div className="flex flex-col h-[400px] rounded-xl overflow-hidden border border-[var(--card-border)] bg-[var(--input-bg)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)]">
            <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">Ask me to add tasks, set reminders, or schedule events!</p>
            <p className="text-xs mt-2 opacity-60">Try: &quot;Add task: buy groceries&quot; or &quot;Schedule dentist at 3pm tomorrow&quot;</p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-[var(--accent-secondary)] to-purple-500 text-white rounded-br-md'
                  : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] rounded-bl-md'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[var(--accent-secondary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[var(--accent-secondary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[var(--accent-secondary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm text-[var(--text-muted)]">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-[var(--card-border)] p-4 bg-[var(--card-bg)]">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask your assistant..."
            className="flex-1 px-4 py-3 bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] placeholder-[var(--text-muted)] focus:border-[var(--accent-secondary)]"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-[#7c3aed] text-white font-medium rounded-xl hover:bg-[#6d28d9] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}

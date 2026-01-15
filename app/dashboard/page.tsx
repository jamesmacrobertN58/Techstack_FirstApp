// app/dashboard/page.tsx
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { addTodo, toggleTodoStatus } from '@/app/actions/todos'
import { toggleReminderStatus } from '@/app/actions/reminders'
import { Chat } from '@/app/components/chat'
import { UserButton } from '@clerk/nextjs'

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const supabase = await createClient()
  
  // Fetch todos
  const { data: todos } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('inserted_at', { ascending: false })

  // Fetch reminders
  const { data: reminders } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const pendingTasks = todos?.filter(t => t.status !== 'completed').length || 0
  const completedTasks = todos?.filter(t => t.status === 'completed').length || 0
  const activeReminders = reminders?.filter(r => r.status === 'pending').length || 0

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-[var(--card-border)] bg-[var(--card-bg)]/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white font-bold text-lg">
              N
            </div>
            <span className="text-xl font-semibold tracking-tight">Nineteen58</span>
          </div>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 ring-2 ring-[var(--accent-primary)]/30"
              }
            }}
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in">
          <div className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-[var(--accent-primary)]">{pendingTasks}</p>
                <p className="text-sm text-[var(--text-muted)]">Pending Tasks</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-500">{completedTasks}</p>
                <p className="text-sm text-[var(--text-muted)]">Completed</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-warning)]/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[var(--accent-warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-[var(--accent-warning)]">{activeReminders}</p>
                <p className="text-sm text-[var(--text-muted)]">Active Reminders</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasks Section */}
          <section className="glass-card p-6 animate-fade-in stagger-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold">Tasks</h2>
            </div>
      
      {/* Add Todo Form */}
      <form action={async (formData) => {
        'use server'
        const task = formData.get('task') as string
        if (task) await addTodo(task)
            }} className="mb-5">
              <div className="flex gap-2">
        <input 
          type="text" 
          name="task" 
                  placeholder="What needs to be done?"
                  className="flex-1 px-4 py-3 bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] placeholder-[var(--text-muted)] focus:border-[var(--accent-primary)]"
          required
        />
        <button 
          type="submit"
                  className="px-5 py-3 bg-[#00d4aa] text-black font-semibold rounded-xl hover:bg-[#00b894] hover:scale-[1.02] active:scale-[0.98]"
        >
          Add
        </button>
              </div>
      </form>

      {/* Todo List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
      {todos?.length === 0 && (
                <div className="text-center py-8 text-[var(--text-muted)]">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>No tasks yet. Add one above!</p>
                </div>
              )}
              {todos?.map((todo, index) => (
                <form 
                  key={todo.id} 
                  action={async () => {
                    'use server'
                    await toggleTodoStatus(todo.id, todo.status)
                  }}
                >
                  <button 
                    type="submit"
                    className={`w-full p-4 rounded-xl flex items-center gap-3 text-left cursor-pointer transition-all hover:scale-[1.01] ${
                      todo.status === 'completed' 
                        ? 'bg-green-500/10 border border-green-500/20' 
                        : 'bg-[var(--input-bg)] border border-[var(--card-border)] hover:border-[var(--accent-primary)]/50'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      todo.status === 'completed' 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-[var(--text-muted)]'
                    }`}>
                      {todo.status === 'completed' && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`flex-1 ${todo.status === 'completed' ? 'line-through text-[var(--text-muted)]' : ''}`}>
                      {todo.task}
                    </span>
                  </button>
                </form>
              ))}
            </div>
          </section>

          {/* Reminders Section */}
          <section className="glass-card p-6 animate-fade-in stagger-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-warning)]/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-[var(--accent-warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold">Reminders</h2>
            </div>
            
            {/* Reminder Form */}
            <form action={async (formData) => {
              'use server'
              const { createReminder } = await import('@/app/actions/reminders')
              const message = formData.get('reminder') as string
              const minutes = parseInt(formData.get('minutes') as string) || 1
              if (message) await createReminder(message, minutes)
            }} className="mb-5">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  name="reminder" 
                  placeholder="Remind me to..."
                  className="flex-1 px-4 py-3 bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] placeholder-[var(--text-muted)] focus:border-[var(--accent-warning)]"
                  required
                />
                <input 
                  type="number" 
                  name="minutes" 
                  placeholder="min"
                  defaultValue={1}
                  min={1}
                  className="w-20 px-3 py-3 bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl text-center text-[var(--foreground)] focus:border-[var(--accent-warning)]"
                />
                <button 
                  type="submit"
                  className="px-5 py-3 bg-[#f59e0b] text-black font-semibold rounded-xl hover:bg-[#d97706] hover:scale-[1.02] active:scale-[0.98]"
                >
                  Set
                </button>
              </div>
            </form>

            {/* Reminders List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {reminders?.length === 0 && (
                <div className="text-center py-8 text-[var(--text-muted)]">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>No reminders set.</p>
                </div>
              )}
              {reminders?.map((reminder, index) => (
                <form 
                  key={reminder.id}
                  action={async () => {
                    'use server'
                    await toggleReminderStatus(reminder.id, reminder.status)
                  }}
                >
                  <button 
                    type="submit"
                    className={`w-full p-4 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all hover:scale-[1.01] ${
                      reminder.status === 'completed' 
                        ? 'bg-green-500/10 border border-green-500/20' 
                        : reminder.status === 'fired'
                        ? 'bg-[var(--accent-info)]/10 border border-[var(--accent-info)]/20'
                        : 'bg-[var(--input-bg)] border border-[var(--card-border)] hover:border-[var(--accent-warning)]/50'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        reminder.status === 'completed' 
                          ? 'bg-green-500' 
                          : reminder.status === 'fired'
                          ? 'bg-[var(--accent-info)] animate-pulse'
                          : 'bg-[var(--accent-warning)] animate-pulse'
                      }`} />
                      <span className={reminder.status === 'completed' ? 'line-through text-[var(--text-muted)]' : ''}>
                        {reminder.message}
                      </span>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      reminder.status === 'completed' 
                        ? 'bg-green-500/20 text-green-400' 
                        : reminder.status === 'fired'
                        ? 'bg-[var(--accent-info)]/20 text-[var(--accent-info)]'
                        : 'bg-[var(--accent-warning)]/20 text-[var(--accent-warning)]'
                    }`}>
                      {reminder.status}
                    </span>
                  </button>
                </form>
              ))}
            </div>
          </section>
        </div>

        {/* AI Assistant Section */}
        <section className="mt-6 glass-card p-6 animate-fade-in stagger-3">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-secondary)]/20 flex items-center justify-center animate-pulse-glow">
              <svg className="w-4 h-4 text-[var(--accent-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">AI Assistant</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)] font-medium">
              Powered by GPT
            </span>
          </div>
          <Chat />
        </section>
      </main>
    </div>
  )
}

// app/dashboard/page.tsx
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { addTodo } from '@/app/actions/todos'
import { Chat } from '@/app/components/chat'

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

  return (
    <div className="p-8 max-w-2xl mx-auto">
      
      {/* ===== TASKS SECTION ===== */}
      <h1 className="text-2xl font-bold mb-4">📋 Your Tasks</h1>
      
      {/* Add Todo Form */}
      <form action={async (formData) => {
        'use server'
        const task = formData.get('task') as string
        if (task) await addTodo(task)
      }} className="mb-4 flex gap-2">
        <input 
          type="text" 
          name="task" 
          placeholder="Enter a new task..."
          className="flex-1 px-4 py-2 border rounded-lg"
          required
        />
        <button 
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add
        </button>
      </form>

      {/* Todo List */}
      <div className="mb-8">
        {todos?.length === 0 && (
          <p className="text-gray-500">No tasks yet. Add one above!</p>
        )}
        {todos?.map((todo) => (
          <div key={todo.id} className="p-4 border rounded-lg mb-2 flex justify-between">
            <span>{todo.task}</span>
            <span className="text-sm text-gray-500">{todo.status}</span>
          </div>
        ))}
      </div>

      {/* ===== REMINDERS SECTION ===== */}
      <h2 className="text-2xl font-bold mb-4">⏰ Reminders</h2>
      
      {/* Reminder Form */}
      <form action={async (formData) => {
        'use server'
        const { createReminder } = await import('@/app/actions/reminders')
        const message = formData.get('reminder') as string
        const minutes = parseInt(formData.get('minutes') as string) || 1
        if (message) await createReminder(message, minutes)
      }} className="mb-4 p-4 border rounded-lg bg-gray-50">
        <div className="flex gap-2">
          <input 
            type="text" 
            name="reminder" 
            placeholder="Remind me to..."
            className="flex-1 px-4 py-2 border rounded-lg"
            required
          />
          <input 
            type="number" 
            name="minutes" 
            placeholder="mins"
            defaultValue={1}
            min={1}
            className="w-20 px-3 py-2 border rounded-lg"
          />
          <button 
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Set
          </button>
        </div>
      </form>

      {/* Reminders List */}
      <div className="mb-8">
        {reminders?.length === 0 && (
          <p className="text-gray-500">No reminders set.</p>
        )}
        {reminders?.map((reminder) => (
          <div key={reminder.id} className="p-4 border rounded-lg mb-2 flex justify-between items-center">
            <span>{reminder.message}</span>
            <span className={`text-sm px-2 py-1 rounded ${
              reminder.status === 'fired' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {reminder.status}
            </span>
          </div>
        ))}
      </div>

      {/* ===== AI ASSISTANT SECTION ===== */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">💬 Nineteen58 AI Agent</h2>
        <Chat />
      </div>
    </div>
  )
}
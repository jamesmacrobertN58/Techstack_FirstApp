// app/dashboard/page.tsx
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { addTodo } from '@/app/actions/todos'

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const supabase = await createClient()
  
  const { data: todos, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('inserted_at', { ascending: false })

  if (error) {
    console.error('Error fetching todos:', error)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Tasks</h1>
      
      {/* Add Todo Form */}
      <form action={async (formData) => {
        'use server'
        const task = formData.get('task') as string
        if (task) await addTodo(task)
      }} className="mb-8 flex gap-2">
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
{/* Reminder Form */}
<form action={async (formData) => {
        'use server'
        const { createReminder } = await import('@/app/actions/reminders')
        const message = formData.get('reminder') as string
        const minutes = parseInt(formData.get('minutes') as string) || 1
        if (message) await createReminder(message, minutes)
      }} className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="font-semibold mb-3">⏰ Set a Reminder</h2>
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

      {/* ========== END OF NEW SECTION ========== */}
      {/* Todo List */}
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
  )
}
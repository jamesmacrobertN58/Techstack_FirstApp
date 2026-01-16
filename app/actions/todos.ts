// app/actions/todos.ts
'use server'

import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTodo(task: string) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Not authenticated')
  }

  const supabase = await createClient()
  
  const { error } = await supabase
    .from('todos')
    .insert({
      task,
      user_id: userId,
      status: 'incomplete'
    })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}

export async function toggleTodoStatus(todoId: string, currentStatus: string) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Not authenticated')
  }

  const supabase = await createClient()
  
  const newStatus = currentStatus === 'completed' ? 'incomplete' : 'completed'
  
  const { error } = await supabase
    .from('todos')
    .update({ status: newStatus })
    .eq('id', todoId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}

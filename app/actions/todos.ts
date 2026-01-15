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
      user_id: userId,  // Link to Clerk user
      status: 'pending'
    })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}
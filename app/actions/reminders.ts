'use server'

import { auth } from '@clerk/nextjs/server'
import { tasks } from "@trigger.dev/sdk/v3"
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'  // Add this line
import type { sendReminder } from "@/src/trigger/reminders"

export async function createReminder(message: string, delayMinutes: number) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Not authenticated')
  }

  const supabase = await createClient()
  
  // Calculate when it should fire
  const fireAt = new Date(Date.now() + delayMinutes * 60 * 1000)
  
  // Save reminder to Supabase
  const { data: reminder, error } = await supabase
    .from('reminders')
    .insert({
      user_id: userId,
      message,
      delay_minutes: delayMinutes,
      status: 'pending',
      fire_at: fireAt.toISOString()
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  // Trigger the background task (pass reminder ID)
  const handle = await tasks.trigger<typeof sendReminder>("send-reminder", {
    reminderId: reminder.id,
    userId,
    message,
    delayMinutes,
  })

  return { 
    success: true, 
    taskId: handle.id,
    reminderId: reminder.id
  }
}

export async function toggleReminderStatus(reminderId: number, currentStatus: string) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Not authenticated')
  }

  const supabase = await createClient()
  
  const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
  
  const { error } = await supabase
    .from('reminders')
    .update({ status: newStatus })
    .eq('id', reminderId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}
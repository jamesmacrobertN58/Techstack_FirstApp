'use server'

import { auth } from '@clerk/nextjs/server'
import { tasks } from "@trigger.dev/sdk/v3"
import { createClient } from '@/lib/supabase/server'
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
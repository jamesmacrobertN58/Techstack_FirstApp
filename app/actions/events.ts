'use server'

import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { tasks } from "@trigger.dev/sdk/v3"
import { revalidatePath } from 'next/cache'

export async function createEvent(title: string, eventDate: Date, reminderMinutesBefore: number = 60) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Not authenticated')
  }

  const supabase = await createClient()
  
  // Save event to Supabase
  const { data: event, error } = await supabase
    .from('events')
    .insert({
      user_id: userId,
      title,
      event_date: eventDate.toISOString(),
      reminder_minutes_before: reminderMinutesBefore,
      status: 'incomplete'
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  // Calculate when to send reminder
  const reminderTime = new Date(eventDate.getTime() - reminderMinutesBefore * 60 * 1000)
  const now = new Date()
  const delayMinutes = Math.max(1, Math.floor((reminderTime.getTime() - now.getTime()) / 60000))

  // Schedule reminder via Trigger.dev
  if (delayMinutes > 0) {
    await tasks.trigger("send-event-reminder", {
      eventId: event.id,
      userId,
      title,
      eventDate: eventDate.toISOString(),
      delayMinutes,
    })
  }

  revalidatePath('/dashboard')
  
  return { success: true, event }
}
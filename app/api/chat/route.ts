import { openai } from '@ai-sdk/openai'
import { streamText, tool } from 'ai'
import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { tasks } from "@trigger.dev/sdk/v3"
import type { sendReminder } from "@/src/trigger/reminders"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { messages } = await req.json()
    const supabase = await createClient()

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: `You are a task and reminder management assistant. 

RULES:
1. When the user says "add task", "todo", or mentions something to do WITHOUT a time delay, use the addTask tool
2. When the user says "remind me", "set reminder", or "reminder" WITH a time delay (like "in 5 minutes", "in 1 hour"), use the setReminder tool
3. When the user mentions an EVENT with a specific DATE/TIME (like "Dentist at 2pm Feb 23"), use the scheduleEvent tool
4. Always confirm what you added after using a tool

IMPORTANT: 
- "Remind me to X" or "Set reminder to X" = use setReminder (default to 1 minute if no time specified)
- "Add task X" or "Todo: X" = use addTask
- For reminders, extract the delay in minutes (e.g., "in 5 minutes" = 5, "in 1 hour" = 60)

For event dates, convert to ISO format (YYYY-MM-DDTHH:MM:SS). Assume current year is 2026 if not specified.`,
      messages,
      tools: {
        addTask: tool({
          description: 'Add a task or todo item to the task list (no time-based reminder)',
          parameters: z.object({
            task: z.string().describe('The task description'),
          }),
          execute: async ({ task }) => {
            console.log('Adding task:', task)
            
            const { error } = await supabase
              .from('todos')
              .insert({
                task,
                user_id: userId,
                status: 'incomplete'
              })

            if (error) {
              console.error('Error:', error)
              return { success: false, error: error.message }
            }
            
            return { success: true, message: `Added task: "${task}"` }
          },
        }),
        setReminder: tool({
          description: 'Set a timed reminder that will fire after a specified number of minutes',
          parameters: z.object({
            message: z.string().describe('What to be reminded about'),
            delayMinutes: z.number().describe('Number of minutes until the reminder fires (default 1)'),
          }),
          execute: async ({ message, delayMinutes }) => {
            console.log('Setting reminder:', message, 'in', delayMinutes, 'minutes')
            
            const fireAt = new Date(Date.now() + delayMinutes * 60 * 1000)
            
            // Save reminder to Supabase
            const { data: reminder, error } = await supabase
              .from('reminders')
              .insert({
                user_id: userId,
                message,
                delay_minutes: delayMinutes,
                status: 'incomplete',
                fire_at: fireAt.toISOString()
              })
              .select()
              .single()

            if (error) {
              console.error('Error:', error)
              return { success: false, error: error.message }
            }

            // Trigger the background task
            try {
              await tasks.trigger<typeof sendReminder>("send-reminder", {
                reminderId: reminder.id,
                userId,
                message,
                delayMinutes,
              })
            } catch (triggerError) {
              console.error('Trigger error:', triggerError)
              // Reminder is still saved, just won't auto-fire
            }
            
            return { 
              success: true, 
              message: `Reminder set: "${message}" - will fire in ${delayMinutes} minute${delayMinutes > 1 ? 's' : ''}` 
            }
          },
        }),
        scheduleEvent: tool({
          description: 'Schedule an event or appointment with a specific date and time',
          parameters: z.object({
            title: z.string().describe('The event title (e.g., "Dentist appointment")'),
            dateTime: z.string().describe('The date and time in ISO format (e.g., "2026-02-23T14:00:00")'),
          }),
          execute: async ({ title, dateTime }) => {
            console.log('Scheduling event:', title, 'at', dateTime)
            
            try {
              const eventDate = new Date(dateTime)
              
              const { data, error } = await supabase
                .from('events')
                .insert({
                  user_id: userId,
                  title,
                  event_date: eventDate.toISOString(),
                  status: 'incomplete'
                })
                .select()
                .single()

              if (error) {
                console.error('Error:', error)
                return { success: false, error: error.message }
              }
              
              return { 
                success: true, 
                message: `Scheduled "${title}" for ${eventDate.toLocaleString()}` 
              }
            } catch (err) {
              console.error('Date parsing error:', err)
              return { success: false, error: 'Invalid date format' }
            }
          },
        }),
      },
      maxSteps: 3,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: String(error) }), { 
      status: 500 
    })
  }
}

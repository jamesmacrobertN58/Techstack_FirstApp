import { openai } from '@ai-sdk/openai'
import { streamText, tool } from 'ai'
import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

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
      system: `You are a task and event management assistant. 

RULES:
1. When the user mentions a TASK or TODO, use the addTask tool
2. When the user mentions an EVENT with a specific DATE/TIME (like "Dentist at 2pm Feb 23"), use the scheduleEvent tool
3. Always confirm what you added after using a tool

For dates, convert to ISO format (YYYY-MM-DDTHH:MM:SS). Assume current year is 2026 if not specified.`,
      messages,
      tools: {
        addTask: tool({
          description: 'Add a task or todo item (no specific date/time)',
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
                status: 'pending'
              })

            if (error) {
              console.error('Error:', error)
              return { success: false, error: error.message }
            }
            
            return { success: true, message: `Added task: ${task}` }
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
                  status: 'scheduled'
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
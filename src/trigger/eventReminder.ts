import { task, wait } from "@trigger.dev/sdk/v3"
import { createClient } from "@supabase/supabase-js"

export const sendEventReminder = task({
  id: "send-event-reminder",
  run: async (payload: { 
    eventId: number
    userId: string
    title: string
    eventDate: string
    delayMinutes: number 
  }) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Wait until reminder time
    await wait.for({ minutes: payload.delayMinutes })
    
    // Update event status
    await supabase
      .from('events')
      .update({ status: 'reminded' })
      .eq('id', payload.eventId)
    
    console.log(`🔔 REMINDER: ${payload.title} is coming up!`)
    
    // Here you could send an email, SMS, push notification, etc.
    
    return { 
      success: true, 
      message: `Reminder sent for: ${payload.title}`,
    }
  },
})
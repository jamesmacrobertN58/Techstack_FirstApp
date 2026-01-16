import { task, wait } from "@trigger.dev/sdk/v3";
import { createClient } from "@supabase/supabase-js";

export const sendReminder = task({
  id: "send-reminder",
  run: async (payload: { 
    reminderId: string;
    userId: string; 
    message: string; 
    delayMinutes: number 
  }) => {
    // Create Supabase client INSIDE run function with SECRET key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!  // Changed to new key name
    );

    // Wait for the specified delay
    await wait.for({ minutes: payload.delayMinutes });
    
    // Mark reminder as fired in Supabase
    const { error } = await supabase
      .from('reminders')
      .update({ 
        status: 'fired',
        fired_at: new Date().toISOString()
      })
      .eq('id', payload.reminderId);

    if (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
    
    console.log(`⏰ REMINDER FIRED for user ${payload.userId}: ${payload.message}`);
    
    return { 
      success: true, 
      message: payload.message,
      deliveredAt: new Date().toISOString()
    };
  },
});
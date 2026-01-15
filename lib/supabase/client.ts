import { createBrowserClient } from "@supabase/ssr"
import { useAuth } from "@clerk/nextjs"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!  // Changed to new key name
  )
}

// For authenticated client-side queries, use this hook in components:
export function useSupabaseClient() {
  const { getToken } = useAuth()
  
  const getAuthenticatedClient = async () => {
    const token = await getToken({ template: 'supabase' })
    
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,  // Changed to new key name
      {
        global: {
          headers: token ? {
            Authorization: `Bearer ${token}`,
          } : {},
        },
      }
    )
  }
  
  return { getAuthenticatedClient }
}
import { google } from 'googleapis'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function addToGoogleCalendar({
  title,
  description,
  startTime,
  endTime,
}: {
  title: string
  description?: string
  startTime: Date
  endTime?: Date
}) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Not authenticated')
  }

  // Get the user's Google OAuth token from Clerk
  const client = await clerkClient()
  const tokenResponse = await client.users.getUserOauthAccessToken(userId, 'google')
  
  const tokens = tokenResponse.data
  if (!tokens || tokens.length === 0) {
    throw new Error('Google account not connected. Please connect your Google account in settings.')
  }

  const accessToken = tokens[0].token

  // Create OAuth2 client with the access token
  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: accessToken })

  // Create Calendar API client
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  // Default end time is 30 minutes after start
  const eventEndTime = endTime || new Date(startTime.getTime() + 30 * 60 * 1000)

  // Create the event
  const event = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: title,
      description: description,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: eventEndTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 10 },
        ],
      },
    },
  })

  return {
    success: true,
    eventId: event.data.id,
    eventLink: event.data.htmlLink,
  }
}

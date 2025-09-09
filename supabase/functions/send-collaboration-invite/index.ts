import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { CollaborationInviteEmail } from './_templates/collaboration-invite.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: { "Content-Type": "application/json", ...corsHeaders }
    })
  }

  try {
    const { to, shareUrl, decisionTitle, inviterName, inviterEmail, locale = 'fr' } = await req.json()

    console.log('Sending collaboration invite:', { to, shareUrl, decisionTitle, locale })

    // Validate required fields
    if (!to || !shareUrl || !decisionTitle) {
      return new Response(JSON.stringify({ error: "Missing required fields: to, shareUrl, decisionTitle" }), { 
        status: 400, 
        headers: { "Content-Type": "application/json", ...corsHeaders }
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), { 
        status: 400, 
        headers: { "Content-Type": "application/json", ...corsHeaders }
      })
    }

    // Render email template
    const html = await renderAsync(
      React.createElement(CollaborationInviteEmail, {
        shareUrl,
        decisionTitle,
        inviterName: inviterName || 'Un collaborateur',
        locale,
      })
    )

    // Send email
    const { error } = await resend.emails.send({
      from: "Rationable <onboarding@resend.dev>", // You'll need to update this with a verified domain
      to: [to],
      reply_to: inviterEmail ? [inviterEmail] : undefined,
      subject: locale === 'fr' ? `Invitation à collaborer: ${decisionTitle}` : `Collaboration invite: ${decisionTitle}`,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log('Email sent successfully to:', to)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    })

  } catch (error: any) {
    console.error('Error in send-collaboration-invite function:', error)
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error occurred' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    )
  }
}

serve(handler)
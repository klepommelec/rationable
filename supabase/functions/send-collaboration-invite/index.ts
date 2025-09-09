import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface CollaborationInviteEmailProps {
  shareUrl: string
  decisionTitle: string
  inviterName: string
  locale?: string
}

const CollaborationInviteEmail = ({
  shareUrl,
  decisionTitle,
  inviterName,
  locale = 'fr',
}: CollaborationInviteEmailProps) => {
  const texts = locale === 'fr' ? {
    preview: `Invitation à collaborer sur: ${decisionTitle}`,
    heading: 'Invitation à collaborer',
    intro: `${inviterName} vous invite à consulter et commenter l'analyse de décision:`,
    cta: 'Voir la décision',
    description: 'Vous pourrez donner votre avis et laisser des commentaires.',
    footer: 'Rationable · www.rationable.ai'
  } : {
    preview: `Collaboration invite for: ${decisionTitle}`,
    heading: 'Collaboration Invite',
    intro: `${inviterName} has invited you to view and comment on this decision analysis:`,
    cta: 'View Decision',
    description: 'You can share your feedback and leave comments.',
    footer: 'Rationable · www.rationable.ai'
  }

  return (
    React.createElement(Html, {},
      React.createElement(Head, {}),
      React.createElement(Preview, {}, texts.preview),
      React.createElement(Body, { style: main },
        React.createElement(Container, { style: container },
          React.createElement(Heading, { style: heading }, texts.heading),
          React.createElement(Text, { style: text }, texts.intro),
          React.createElement(Text, { style: decisionTitleStyle }, `"${decisionTitle}"`),
          React.createElement(Section, { style: buttonContainer },
            React.createElement('a', {
              href: shareUrl,
              target: '_blank',
              style: button
            }, texts.cta)
          ),
          React.createElement(Text, { style: description }, texts.description),
          React.createElement(Hr, { style: hr }),
          React.createElement(Text, { style: footer }, texts.footer)
        )
      )
    )
  )
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '24px',
  maxWidth: '600px',
}

const heading = {
  margin: '0 0 24px',
  fontSize: '24px',
  fontWeight: '600',
  color: '#111827',
}

const text = {
  margin: '0 0 16px',
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
}

const decisionTitleStyle = {
  margin: '0 0 24px',
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
}

const description = {
  margin: '24px 0 0',
  fontSize: '14px',
  lineHeight: '20px',
  color: '#6b7280',
}

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
}

const button = {
  display: 'inline-block',
  backgroundColor: '#111827',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: '500',
}

const hr = {
  border: 'none',
  borderTop: '1px solid #e5e7eb',
  margin: '32px 0 24px',
}

const footer = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '0',
}

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

    console.log('Sending collaboration invite:', { 
      to, 
      shareUrl, 
      decisionTitle, 
      locale,
      resendApiKeyExists: !!Deno.env.get('RESEND_API_KEY')
    })

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
    console.log('Attempting to send email via Resend...')
    const emailResult = await resend.emails.send({
      from: "Rationable <contact@rationable.ai>", // Using verified domain email
      to: [to],
      reply_to: inviterEmail ? [inviterEmail] : undefined,
      subject: locale === 'fr' ? `Invitation à collaborer: ${decisionTitle}` : `Collaboration invite: ${decisionTitle}`,
      html,
    })

    console.log('Resend API response:', { emailResult })

    if (emailResult.error) {
      console.error('Resend error details:', emailResult.error)
      throw new Error(`Email sending failed: ${emailResult.error.message || 'Unknown error'}`)
    }

    console.log('Email sent successfully to:', to, 'with ID:', emailResult.data?.id)

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
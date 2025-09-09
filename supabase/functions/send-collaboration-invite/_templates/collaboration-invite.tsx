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
import * as React from 'npm:react@18.3.1'

interface CollaborationInviteEmailProps {
  shareUrl: string
  decisionTitle: string
  inviterName: string
  locale?: string
}

export const CollaborationInviteEmail = ({
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
    <Html>
      <Head />
      <Preview>{texts.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>
            {texts.heading}
          </Heading>
          
          <Text style={text}>
            {texts.intro}
          </Text>
          
          <Text style={decisionTitleStyle}>
            "{decisionTitle}"
          </Text>
          
          <Section style={buttonContainer}>
            <a
              href={shareUrl}
              target="_blank"
              style={button}
            >
              {texts.cta}
            </a>
          </Section>
          
          <Text style={description}>
            {texts.description}
          </Text>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            {texts.footer}
          </Text>
        </Container>
      </Body>
    </Html>
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
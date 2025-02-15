
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface MagicLinkEmailProps {
  magicLink: string;
  email: string;
}

export const MagicLinkEmail = ({
  magicLink,
  email,
}: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>Your login link for Empire's Legacy</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Login to Empire's Legacy</Heading>
        <Text style={text}>
          Click the button below to log in to your account ({email}).
        </Text>
        <Link
          href={magicLink}
          target="_blank"
          style={{
            ...link,
            display: 'block',
            marginBottom: '16px',
          }}
        >
          Log In to Empire's Legacy
        </Link>
        <Text style={footer}>
          If you didn't request this email, you can safely ignore it.
          This link will expire in 1 hour.
        </Text>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'system-ui',
}

const container = {
  padding: '2rem',
  margin: '0 auto',
  maxWidth: '600px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
}

const text = {
  color: '#333',
  fontSize: '16px',
  margin: '24px 0',
}

const link = {
  color: '#fff',
  backgroundColor: '#3b82f6',
  padding: '12px 24px',
  borderRadius: '4px',
  textDecoration: 'none',
  textAlign: 'center' as const,
}

const footer = {
  color: '#898989',
  fontSize: '14px',
  margin: '48px 0',
}

# Resend + Supabase Email Integration Guide

Complete setup guide for integrating Resend email service with your Supabase React application.

## 🎯 Overview

This integration allows you to send professional emails from your custom domain (`charles@allianceprocurementandcapacitybuilding.org`) using Resend's reliable email service through Supabase Edge Functions.

## 📋 Prerequisites

- Supabase project setup
- React application
- Custom domain from Namecheap
- Node.js installed locally

## 🔑 Step 1: Get Resend API Key

### 1.1 Sign Up for Resend
1. Go to [resend.com](https://resend.com)
2. Click "Get Started Free"
3. Sign up with your email
4. Verify your email address

### 1.2 Add Your Domain
1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter: `allianceprocurementandcapacitybuilding.org`
4. Click **Add**

### 1.3 Configure DNS Records in Namecheap

Add these DNS records in your Namecheap domain panel:

```
Record Type: TXT
Host: @
Value: v=spf1 include:_spf.resend.com ~all
TTL: Automatic

Record Type: CNAME  
Host: resend._domainkey
Value: resend._domainkey.resend.com
TTL: Automatic

Record Type: TXT
Host: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:charles@allianceprocurementandcapacitybuilding.org
TTL: Automatic
```

**Wait 24-48 hours for DNS propagation**

### 1.4 Get API Key
1. Go to **API Keys** in Resend dashboard
2. Click **Create API Key**
3. Name it: "Alliance PCBL Production"
4. Copy the key (starts with `re_`)

## 🔧 Step 2: Create Supabase Edge Function

### 2.1 Install Supabase CLI
```bash
npm install -g supabase
```

### 2.2 Login to Supabase
```bash
supabase login
```

### 2.3 Link Your Project
```bash
cd Alliance-Procurement-And-Capacity-Building-v2
supabase link --project-ref YOUR_PROJECT_REF
```

### 2.4 Create Email Edge Function
```bash
supabase functions new send-email
```

### 2.5 Edit the Edge Function

**File: `supabase/functions/send-email/index.ts`**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface EmailRequest {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set')
    }

    const { to, subject, html, from, replyTo } = await req.json() as EmailRequest

    const emailData = {
      from: from || 'Alliance PCBL <charles@allianceprocurementandcapacitybuilding.org>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(replyTo && { reply_to: replyTo })
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Resend API error:', error)
      throw new Error(`Email sending failed: ${error}`)
    }

    const result = await response.json()

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
```

### 2.6 Create CORS Helper

**File: `supabase/functions/_shared/cors.ts`**

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
```

### 2.7 Set Environment Variable
```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

### 2.8 Deploy Edge Function
```bash
supabase functions deploy send-email
```

## ⚛️ Step 3: React Integration

### 3.1 Create Email Service Hook

**File: `client/src/hooks/useEmailService.ts`**

```typescript
import { supabase } from '@/lib/supabase'

export interface SendEmailRequest {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

export const useEmailService = () => {
  const sendEmail = async (emailData: SendEmailRequest) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData
      })

      if (error) {
        console.error('Email service error:', error)
        throw new Error(error.message || 'Failed to send email')
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Email sending failed')
      }

      return data
    } catch (error) {
      console.error('Error in sendEmail:', error)
      throw error
    }
  }

  const sendRegistrationConfirmation = async (registration: {
    email: string
    firstName: string
    lastName: string
    eventTitle: string
    eventDate: string
    eventLocation: string
    eventPrice: string
    registrationNumber: string
  }) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Registration Confirmation</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #1C356B 0%, #0f1e3d 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .header p { color: #87CEEB; margin: 8px 0 0 0; font-size: 16px; }
          .content { padding: 40px 20px; }
          .content h2 { color: #1C356B; margin-top: 0; }
          .event-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .event-details h3 { color: #1C356B; margin-top: 0; }
          .event-details ul { list-style: none; padding: 0; }
          .event-details li { margin: 8px 0; color: #64748b; }
          .event-details strong { color: #1C356B; }
          .btn { display: inline-block; background: #87CEEB; color: #1C356B; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
          .footer { background: #f8fafc; padding: 30px 20px; text-align: center; color: #64748b; font-size: 14px; }
          .footer strong { color: #1C356B; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Registration Confirmed! ✅</h1>
            <p>Alliance Procurement & Capacity Building</p>
          </div>
          
          <div class="content">
            <h2>Hello ${registration.firstName}!</h2>
            
            <p>Thank you for registering for our upcoming event. We're excited to have you join us!</p>
            
            <div class="event-details">
              <h3>📋 Event Details</h3>
              <ul>
                <li><strong>Event:</strong> ${registration.eventTitle}</li>
                <li><strong>Date:</strong> ${new Date(registration.eventDate).toLocaleDateString('en-GB', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</li>
                <li><strong>Location:</strong> ${registration.eventLocation}</li>
                <li><strong>Investment:</strong> K${registration.eventPrice}</li>
                <li><strong>Registration #:</strong> ${registration.registrationNumber}</li>
              </ul>
            </div>
            
            <p>Please keep this confirmation email for your records. If you have any questions, feel free to contact us.</p>
            
            <p>We look forward to seeing you at the event!</p>
            
            <p>Best regards,<br>
            <strong>Alliance Procurement & Capacity Building Team</strong></p>
          </div>
          
          <div class="footer">
            <p><strong>Alliance Procurement & Capacity Building Ltd</strong></p>
            <p>Email: charles@allianceprocurementandcapacitybuilding.org</p>
            <p>Enhancing procurement capabilities across Africa</p>
          </div>
        </div>
      </body>
      </html>
    `

    return sendEmail({
      to: registration.email,
      subject: `Registration Confirmed: ${registration.eventTitle}`,
      html,
      replyTo: 'charles@allianceprocurementandcapacitybuilding.org'
    })
  }

  const sendNewsletterEmail = async (subscribers: string[], content: {
    title: string
    items: Array<{ title: string; content: string; link?: string }>
  }) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${content.title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: #1C356B; padding: 30px 20px; text-align: center; }
          .header h1 { color: white; margin: 0; }
          .header p { color: #87CEEB; margin: 8px 0 0 0; }
          .content { padding: 30px 20px; }
          .news-item { padding: 20px 0; border-bottom: 1px solid #e2e8f0; }
          .news-item:last-child { border-bottom: none; }
          .news-item h2 { color: #1C356B; margin-top: 0; }
          .news-item a { color: #87CEEB; text-decoration: none; font-weight: 600; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
          .unsubscribe { color: #64748b; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📰 Alliance Newsletter</h1>
            <p>Latest updates on procurement and capacity building</p>
          </div>
          
          <div class="content">
            ${content.items.map(item => `
              <div class="news-item">
                <h2>${item.title}</h2>
                <p>${item.content}</p>
                ${item.link ? `<a href="${item.link}">Read more →</a>` : ''}
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <p><strong>Alliance Procurement & Capacity Building Ltd</strong></p>
            <p>Email: charles@allianceprocurementandcapacitybuilding.org</p>
            <p><a href="#" class="unsubscribe">Unsubscribe from newsletter</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send emails in batches to avoid rate limits
    const batchSize = 10
    const results = []
    
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)
      const result = await sendEmail({
        to: batch,
        subject: content.title,
        html
      })
      results.push(result)
      
      // Small delay between batches
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return results
  }

  return {
    sendEmail,
    sendRegistrationConfirmation,
    sendNewsletterEmail
  }
}
```

## 🔄 Step 4: Update Registration Dialog

**Update: `client/src/components/registration-dialog.tsx`**

Add this import at the top:
```typescript
import { useEmailService } from '@/hooks/useEmailService'
```

Add this inside your component:
```typescript
const { sendRegistrationConfirmation } = useEmailService()
```

Update your registration success handler:
```typescript
// After successful registration
try {
  await sendRegistrationConfirmation({
    email: formData.email,
    firstName: formData.firstName,
    lastName: formData.lastName,
    eventTitle: event.title,
    eventDate: event.startDate,
    eventLocation: event.location,
    eventPrice: event.price,
    registrationNumber: registration.registrationNumber
  })
  
  console.log('Confirmation email sent successfully')
} catch (emailError) {
  console.error('Failed to send confirmation email:', emailError)
  // Don't fail the registration if email fails
}
```

## 📧 Step 5: Admin Newsletter Feature

**Update: `client/src/pages/admin-dashboard.tsx`**

Add this import:
```typescript
import { useEmailService } from '@/hooks/useEmailService'
```

Add newsletter sending functionality:
```typescript
const { sendNewsletterEmail } = useEmailService()

const handleSendNewsletter = async () => {
  try {
    setIsLoading(true)
    
    const subscribers = newsletterSubscriptions.map(sub => sub.email)
    
    await sendNewsletterEmail(subscribers, {
      title: emailSubject,
      items: [{
        title: 'Latest Update',
        content: emailMessage
      }]
    })
    
    toast({
      title: "Newsletter Sent",
      description: `Newsletter sent to ${subscribers.length} subscribers`,
    })
    
    setEmailSubject('')
    setEmailMessage('')
    setShowEmailDialog(false)
  } catch (error) {
    console.error('Newsletter sending failed:', error)
    toast({
      title: "Send Failed", 
      description: "Failed to send newsletter",
      variant: "destructive"
    })
  } finally {
    setIsLoading(false)
  }
}
```

## 🧪 Step 6: Test Your Setup

### 6.1 Test Email Function Locally
```bash
supabase functions serve
```

### 6.2 Test with curl
```bash
curl -X POST http://localhost:54321/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "to": "your-test@email.com",
    "subject": "Test Email",
    "html": "<h1>Hello from Alliance!</h1><p>This is a test email.</p>"
  }'
```

### 6.3 Test in React App
1. Register for an event
2. Check if confirmation email arrives
3. Try sending a newsletter from admin panel

## 🔐 Environment Variables

Add to your `.env` file:
```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# For local development only
RESEND_API_KEY=your_resend_api_key
```

## 📊 Monitoring & Analytics

### Check Email Status in Resend Dashboard:
1. Go to **Logs** in Resend dashboard
2. View delivery status, opens, clicks
3. Monitor bounce rates and spam complaints

### Supabase Function Logs:
```bash
supabase functions logs send-email
```

## 🚨 Troubleshooting

### Common Issues:

1. **DNS not propagated**: Wait 24-48 hours after adding DNS records
2. **API key invalid**: Make sure you copied the full key starting with `re_`
3. **CORS errors**: Check the cors.ts file is properly configured
4. **Rate limits**: Resend free tier: 100 emails/day, 3K/month

### Debug Steps:
1. Check Supabase function logs
2. Verify DNS records in Resend dashboard
3. Test with simple HTML email first
4. Check network tab for API errors

## 📈 Scaling Up

When you need more than 100 emails/day:
- **Resend Pro**: $20/month for 50K emails
- **SendGrid**: $19.95/month for 50K emails  
- **Postmark**: $10/month for 10K emails

## 🎉 You're Ready!

Your email system is now set up with:
- ✅ Professional emails from your domain
- ✅ Registration confirmations
- ✅ Newsletter functionality
- ✅ Admin email management
- ✅ Reliable delivery with Resend
- ✅ Seamless Supabase integration

Start testing with small volumes and gradually increase as your application grows!
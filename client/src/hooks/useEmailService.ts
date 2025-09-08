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
      console.log('Sending email via Supabase function:', emailData.subject)

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

      console.log('Email sent successfully:', data.id)
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
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            line-height: 1.6;
          }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
          .header {
            background: linear-gradient(135deg, #1C356B 0%, #0f1e3d 100%);
            padding: 40px 20px;
            text-align: center;
            position: relative;
          }
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
            opacity: 0.3;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            position: relative;
            z-index: 1;
          }
          .header p {
            color: #87CEEB;
            margin: 8px 0 0 0;
            font-size: 16px;
            font-weight: 600;
            position: relative;
            z-index: 1;
          }
          .content { padding: 40px 30px; }
          .content h2 {
            color: #1C356B;
            margin-top: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .welcome-text {
            font-size: 18px;
            color: #334155;
            margin-bottom: 30px;
            line-height: 1.7;
          }
          .event-details {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 25px;
            border-radius: 12px;
            margin: 25px 0;
            border-left: 4px solid #87CEEB;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }
          .event-details h3 {
            color: #1C356B;
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 20px;
            font-weight: 600;
            display: flex;
            align-items: center;
          }
          .event-details ul { list-style: none; padding: 0; margin: 0; }
          .event-details li {
            margin: 12px 0;
            color: #475569;
            font-size: 16px;
            display: flex;
            align-items: center;
            padding: 8px 0;
          }
          .event-details strong {
            color: #1C356B;
            font-weight: 600;
            min-width: 140px;
            display: inline-block;
          }
          .highlight {
            background: #87CEEB;
            color: #1C356B;
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: 600;
            font-family: monospace;
          }
          .footer {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 30px 20px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
          }
          .footer strong { color: #1C356B; font-size: 16px; }
          .footer-links { margin-top: 15px; }
          .footer-links a { color: #87CEEB; text-decoration: none; margin: 0 10px; }
          .icon { display: inline-block; margin-right: 8px; }
          .divider { height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 25px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1><span class="icon">✅</span> Registration Confirmed!</h1>
            <p>Alliance Procurement & Capacity Building</p>
          </div>

          <div class="content">
            <h2>Hello ${registration.firstName}!</h2>

            <p class="welcome-text">
              Thank you for registering for our upcoming event. We're excited to have you join us for this valuable learning experience!
            </p>

            <div class="event-details">
              <h3><span class="icon">📋</span> Event Details</h3>
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
                <li><strong>Registration #:</strong> <span class="highlight">${registration.registrationNumber}</span></li>
              </ul>
            </div>

            <div class="divider"></div>

            <p><strong>📌 Important Notes:</strong></p>
            <ul style="color: #475569; padding-left: 20px;">
              <li>Please keep this confirmation email for your records</li>
              <li>Arrive 15 minutes early for check-in</li>
              <li>Bring a valid ID and this confirmation</li>
              <li>Contact us if you have any questions</li>
            </ul>

            <div class="divider"></div>

            <p style="color: #475569; font-size: 16px; margin-bottom: 5px;">
              We look forward to seeing you at the event!
            </p>

            <p style="margin-bottom: 0;">
              Best regards,<br>
              <strong style="color: #1C356B;">Alliance Procurement & Capacity Building Team</strong>
            </p>
          </div>

          <div class="footer">
            <p><strong>Alliance Procurement & Capacity Building Ltd</strong></p>
            <p>📧 charles@allianceprocurementandcapacitybuilding.org</p>
            <p>🌍 Enhancing procurement capabilities across Africa</p>
            <div class="footer-links">
              <a href="#">Visit Website</a> |
              <a href="#">Contact Us</a> |
              <a href="#">Unsubscribe</a>
            </div>
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
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            line-height: 1.6;
          }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
          .header {
            background: linear-gradient(135deg, #1C356B 0%, #0f1e3d 100%);
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            color: #87CEEB;
            margin: 8px 0 0 0;
            font-size: 16px;
            font-weight: 600;
          }
          .content { padding: 40px 30px; }
          .news-item {
            padding: 25px 0;
            border-bottom: 2px solid #f1f5f9;
            position: relative;
          }
          .news-item:last-child { border-bottom: none; }
          .news-item:before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(180deg, #87CEEB, #f59e0b);
            border-radius: 2px;
          }
          .news-item h2 {
            color: #1C356B;
            margin: 0 0 15px 15px;
            font-size: 22px;
            font-weight: 600;
          }
          .news-item p {
            color: #475569;
            margin: 0 0 15px 15px;
            font-size: 16px;
            line-height: 1.7;
          }
          .news-item a {
            color: #87CEEB;
            text-decoration: none;
            font-weight: 600;
            margin-left: 15px;
            display: inline-flex;
            align-items: center;
            transition: color 0.3s;
          }
          .news-item a:hover { color: #f59e0b; }
          .footer {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 30px 20px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
          }
          .footer strong { color: #1C356B; font-size: 16px; }
          .unsubscribe {
            color: #64748b;
            text-decoration: none;
            margin-top: 15px;
            display: inline-block;
            font-size: 13px;
          }
          .unsubscribe:hover { color: #475569; }
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
            <p>📧 charles@allianceprocurementandcapacitybuilding.org</p>
            <p>🌍 Enhancing procurement capabilities across Africa</p>
            <a href="#" class="unsubscribe">Unsubscribe from newsletter</a>
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

      try {
        const result = await sendEmail({
          to: batch,
          subject: content.title,
          html
        })
        results.push(result)

        // Small delay between batches to be respectful
        if (i + batchSize < subscribers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(`Failed to send batch ${Math.floor(i / batchSize) + 1}:`, error)
        results.push({ success: false, error: error.message })
      }
    }

    return results
  }

  const sendAdminNotification = async (notification: {
    type: 'new_registration' | 'payment_update' | 'cancellation'
    data: any
  }) => {
    const { type, data } = notification

    let subject = ''
    let content = ''

    switch (type) {
      case 'new_registration':
        subject = `New Registration: ${data.eventTitle}`
        content = `
          <h2>New Event Registration</h2>
          <p><strong>Participant:</strong> ${data.firstName} ${data.lastName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Event:</strong> ${data.eventTitle}</p>
          <p><strong>Registration #:</strong> ${data.registrationNumber}</p>
          <p><strong>Payment Status:</strong> ${data.paymentStatus}</p>
        `
        break
      case 'payment_update':
        subject = `Payment Updated: ${data.registrationNumber}`
        content = `
          <h2>Payment Status Updated</h2>
          <p><strong>Registration #:</strong> ${data.registrationNumber}</p>
          <p><strong>Participant:</strong> ${data.participantName}</p>
          <p><strong>Status:</strong> ${data.oldStatus} → ${data.newStatus}</p>
          <p><strong>Updated by:</strong> ${data.updatedBy}</p>
        `
        break
      case 'cancellation':
        subject = `Registration Cancelled: ${data.registrationNumber}`
        content = `
          <h2>Registration Cancelled</h2>
          <p><strong>Registration #:</strong> ${data.registrationNumber}</p>
          <p><strong>Participant:</strong> ${data.participantName}</p>
          <p><strong>Event:</strong> ${data.eventTitle}</p>
          <p><strong>Reason:</strong> ${data.reason || 'User requested'}</p>
        `
        break
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1C356B; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Admin Notification</h1>
          </div>
          <div class="content">
            ${content}
            <p><em>Time: ${new Date().toLocaleString()}</em></p>
          </div>
          <div class="footer">
            <p>Alliance Procurement & Capacity Building Ltd</p>
          </div>
        </div>
      </body>
      </html>
    `

    return sendEmail({
      to: 'charles@allianceprocurementandcapacitybuilding.org',
      subject,
      html
    })
  }

  return {
    sendEmail,
    sendRegistrationConfirmation,
    sendNewsletterEmail,
    sendAdminNotification
  }
}

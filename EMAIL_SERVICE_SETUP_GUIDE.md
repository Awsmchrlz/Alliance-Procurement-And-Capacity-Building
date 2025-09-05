# Email Service Setup Guide for Alliance Procurement & Capacity Building

This guide provides recommendations for professional email services to handle your domain email (`charles@allianceprocurementandcapacitybuilding.org`) and application notifications.

## 🎯 Requirements Summary

- **Domain**: allianceprocurementandcapacitybuilding.org (Namecheap)
- **Volume**: ~100 emails per day
- **Use Cases**: 
  - Event registration confirmations
  - Newsletter subscriptions
  - Admin notifications
  - User communications
- **Budget**: Professional solution for business use

## 🏆 Recommended Email Services

### 1. **Resend** (Top Choice for Development Teams)

**Why Choose Resend:**
- ✅ Modern, developer-friendly API
- ✅ Excellent deliverability rates
- ✅ React email template support
- ✅ Built-in analytics and tracking
- ✅ Fair pricing model

**Pricing:**
- **Free Tier**: 3,000 emails/month, 100 emails/day
- **Pro Plan**: $20/month for 50,000 emails/month
- **Custom Domain**: Free setup

**Setup Steps:**
```bash
# 1. Install Resend
npm install resend

# 2. Environment variables
RESEND_API_KEY=your_api_key_here
FROM_EMAIL=charles@allianceprocurementandcapacitybuilding.org

# 3. Basic implementation
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'charles@allianceprocurementandcapacitybuilding.org',
  to: ['user@example.com'],
  subject: 'Event Registration Confirmed',
  html: '<p>Thank you for registering!</p>'
});
```

**Domain Setup:**
1. Sign up at [resend.com](https://resend.com)
2. Add your domain in dashboard
3. Add these DNS records to Namecheap:

```
Type: TXT
Host: @
Value: v=spf1 include:_spf.resend.com ~all

Type: CNAME
Host: resend._domainkey
Value: resend._domainkey.resend.com

Type: TXT
Host: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@allianceprocurementandcapacitybuilding.org
```

---

### 2. **SendGrid** (Industry Standard)

**Why Choose SendGrid:**
- ✅ Proven reliability and deliverability
- ✅ Comprehensive email marketing features
- ✅ Advanced analytics and reporting
- ✅ Template management system
- ✅ Twilio backing (enterprise grade)

**Pricing:**
- **Free Tier**: 100 emails/day forever
- **Essentials**: $19.95/month for 50K emails
- **Pro**: $89.95/month for 100K emails

**Setup Steps:**
```bash
# 1. Install SendGrid
npm install @sendgrid/mail

# 2. Environment variables
SENDGRID_API_KEY=your_api_key_here

# 3. Basic implementation
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  from: 'charles@allianceprocurementandcapacitybuilding.org',
  to: 'recipient@example.com',
  subject: 'Event Registration',
  html: '<p>Registration confirmed!</p>'
};

await sgMail.send(msg);
```

---

### 3. **Postmark** (Best for Transactional Emails)

**Why Choose Postmark:**
- ✅ Industry-leading deliverability (98%+)
- ✅ Lightning-fast delivery
- ✅ Excellent bounce/spam handling
- ✅ Beautiful email templates
- ✅ Detailed delivery tracking

**Pricing:**
- **Free Tier**: 100 emails/month
- **10K Plan**: $10/month for 10,000 emails
- **50K Plan**: $50/month for 50,000 emails

**Setup Steps:**
```bash
# 1. Install Postmark
npm install postmark

# 2. Environment variables
POSTMARK_API_TOKEN=your_server_token_here

# 3. Basic implementation
const postmark = require('postmark');
const client = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN);

await client.sendEmail({
  From: 'charles@allianceprocurementandcapacitybuilding.org',
  To: 'recipient@example.com',
  Subject: 'Event Registration',
  HtmlBody: '<p>Registration confirmed!</p>'
});
```

---

### 4. **Mailgun** (Flexible and Powerful)

**Why Choose Mailgun:**
- ✅ Pay-as-you-go pricing
- ✅ Powerful API with advanced features
- ✅ Good deliverability rates
- ✅ Email validation services
- ✅ Flexible routing options

**Pricing:**
- **Foundation**: $35/month for 50K emails
- **Growth**: $80/month for 100K emails
- **Pay-as-you-go**: $0.80 per 1K emails

---

## 🎨 Email Templates for Your Application

### Registration Confirmation Template
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Registration Confirmation</title>
    <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #1C356B 0%, #0f1e3d 100%); color: white; padding: 40px 20px; text-align: center; }
        .content { padding: 30px 20px; background: #ffffff; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; }
        .btn { background: #FDC123; color: #1C356B; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Registration Confirmed!</h1>
            <p>Alliance Procurement & Capacity Building</p>
        </div>
        <div class="content">
            <h2>Hello {{firstName}}!</h2>
            <p>Thank you for registering for <strong>{{eventTitle}}</strong>.</p>
            <p><strong>Event Details:</strong></p>
            <ul>
                <li>Date: {{eventDate}}</li>
                <li>Location: {{eventLocation}}</li>
                <li>Investment: {{eventPrice}}</li>
            </ul>
            <p><a href="{{eventLink}}" class="btn">View Event Details</a></p>
        </div>
        <div class="footer">
            <p>Alliance Procurement & Capacity Building Ltd</p>
            <p>Email: charles@allianceprocurementandcapacitybuilding.org</p>
        </div>
    </div>
</body>
</html>
```

### Newsletter Template
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Alliance Newsletter</title>
    <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: #1C356B; color: white; padding: 20px; text-align: center; }
        .news-item { padding: 20px; border-bottom: 1px solid #eee; }
        .cta { text-align: center; padding: 30px; background: #f8f9fa; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Alliance Newsletter</h1>
            <p>Latest updates on procurement and capacity building</p>
        </div>
        <div class="news-item">
            <h2>{{newsTitle}}</h2>
            <p>{{newsContent}}</p>
        </div>
        <div class="cta">
            <a href="{{unsubscribeLink}}" style="color: #666; text-decoration: none;">Unsubscribe</a>
        </div>
    </div>
</body>
</html>
```

## 🔧 Implementation in Your App

### 1. Create Email Service Module

```typescript
// server/services/emailService.ts
import { Resend } from 'resend';

export class EmailService {
  private resend: Resend;
  
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendRegistrationConfirmation(data: {
    to: string;
    firstName: string;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
    eventPrice: string;
  }) {
    try {
      const result = await this.resend.emails.send({
        from: 'Alliance PCBL <charles@allianceprocurementandcapacitybuilding.org>',
        to: [data.to],
        subject: `Registration Confirmed: ${data.eventTitle}`,
        html: this.getRegistrationTemplate(data)
      });
      
      console.log('Email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendNewsletter(subscribers: string[], content: {
    title: string;
    items: Array<{ title: string; content: string; }>;
  }) {
    const emails = subscribers.map(email => ({
      from: 'Alliance PCBL <charles@allianceprocurementandcapacitybuilding.org>',
      to: email,
      subject: content.title,
      html: this.getNewsletterTemplate(content)
    }));

    try {
      const result = await this.resend.batch.send(emails);
      console.log('Newsletter sent to', subscribers.length, 'subscribers');
      return result;
    } catch (error) {
      console.error('Failed to send newsletter:', error);
      throw error;
    }
  }

  private getRegistrationTemplate(data: any): string {
    // Return your HTML template with data interpolation
    return `<!-- Your registration template HTML -->`;
  }

  private getNewsletterTemplate(content: any): string {
    // Return your newsletter template HTML
    return `<!-- Your newsletter template HTML -->`;
  }
}
```

### 2. Update Your Routes

```typescript
// server/routes.ts
import { EmailService } from './services/emailService';

const emailService = new EmailService();

// In your registration endpoint
app.post("/api/events/register", async (req, res) => {
  try {
    // ... existing registration logic ...
    
    // Send confirmation email
    await emailService.sendRegistrationConfirmation({
      to: registration.email,
      firstName: registration.firstName,
      eventTitle: event.title,
      eventDate: event.startDate,
      eventLocation: event.location,
      eventPrice: event.price
    });

    res.json({ success: true, registration });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});
```

### 3. Environment Variables

```bash
# .env
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=charles@allianceprocurementandcapacitybuilding.org
APP_URL=https://your-domain.com
```

## 📊 Comparison Table

| Feature | Resend | SendGrid | Postmark | Mailgun |
|---------|--------|----------|----------|---------|
| **Free Tier** | 3K/month | 100/day | 100/month | No |
| **Deliverability** | Excellent | Excellent | Best-in-class | Good |
| **Developer UX** | Modern | Standard | Good | Complex |
| **Templates** | React/HTML | Drag & Drop | Beautiful | Basic |
| **Analytics** | Built-in | Advanced | Detailed | Standard |
| **Pricing (50K)** | $20/month | $19.95/month | $50/month | $35/month |

## 🏁 Final Recommendation

**For Your Use Case: Choose Resend**

**Reasons:**
1. **Perfect fit**: Free tier covers 100 emails/day exactly
2. **Modern API**: Clean, developer-friendly integration
3. **Domain setup**: Simple DNS configuration
4. **React templates**: Future-proof for advanced templates
5. **Scalability**: Easy to upgrade as you grow

**Quick Start:**
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain with DNS records
3. Get API key and integrate (code examples above)
4. Test with a few emails before going live

**Backup Option**: If Resend doesn't work out, SendGrid's free tier (100 emails/day) is an excellent fallback with proven reliability.

## 🔒 Security Best Practices

1. **Environment Variables**: Never hardcode API keys
2. **Rate Limiting**: Implement email sending limits
3. **Validation**: Verify email addresses before sending
4. **Unsubscribe**: Always include unsubscribe links
5. **SPF/DKIM**: Properly configure DNS for deliverability
6. **Monitoring**: Track bounce rates and spam complaints

## 📞 Support Resources

- **Resend Docs**: [resend.com/docs](https://resend.com/docs)
- **Namecheap DNS**: [namecheap.com/support/knowledgebase/](https://www.namecheap.com/support/knowledgebase/)
- **Email Deliverability**: [mail-tester.com](https://www.mail-tester.com/) for testing

---

*This guide ensures professional email delivery for Alliance Procurement & Capacity Building with reliable, scalable solutions.*
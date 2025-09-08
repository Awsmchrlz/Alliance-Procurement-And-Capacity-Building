# 📧 Email Service Deployment Guide - Alliance PCBL

Complete step-by-step guide to deploy Resend email integration with your Supabase React application.

## 🎯 Quick Overview

You now have a complete email system that will:
- ✅ Send professional registration confirmations
- ✅ Handle newsletter campaigns  
- ✅ Use your custom domain: `charles@allianceprocurementandcapacitybuilding.org`
- ✅ Support 100 emails/day (free tier)
- ✅ Work seamlessly with Supabase

## 🚀 Step-by-Step Deployment

### Step 1: Get Your Resend API Key

1. **Sign up at Resend:**
   - Go to [resend.com](https://resend.com)
   - Click "Get Started Free"
   - Use your email to create account

2. **Add Your Domain:**
   - Click **Domains** in dashboard
   - Click **Add Domain**
   - Enter: `allianceprocurementandcapacitybuilding.org`
   - Click **Add**

3. **Get API Key:**
   - Go to **API Keys** section
   - Click **Create API Key**
   - Name: "Alliance PCBL Production"
   - **Copy the key** (starts with `re_`)
   - **SAVE THIS KEY SAFELY!**

### Step 2: Configure DNS in Namecheap

Log into your Namecheap account and add these DNS records:

#### Record 1: SPF
```
Type: TXT
Host: @
Value: v=spf1 include:_spf.resend.com ~all
TTL: Automatic
```

#### Record 2: DKIM
```
Type: CNAME
Host: resend._domainkey
Value: resend._domainkey.resend.com
TTL: Automatic
```

#### Record 3: DMARC
```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:charles@allianceprocurementandcapacitybuilding.org
TTL: Automatic
```

**⏰ Wait 24-48 hours for DNS propagation**

### Step 3: Deploy Supabase Edge Function

1. **Install Supabase CLI:**
```bash
npm install -g supabase
```

2. **Login to Supabase:**
```bash
supabase login
```

3. **Link Your Project:**
```bash
cd Alliance-Procurement-And-Capacity-Building-v2
supabase link --project-ref YOUR_PROJECT_REF
```

4. **Set Your API Key Secret:**
```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```
*Replace `your_resend_api_key_here` with your actual API key*

5. **Deploy Email Function:**
```bash
supabase functions deploy send-email
```

### Step 4: Test Your Setup

1. **Test the Function:**
```bash
supabase functions invoke send-email --data '{
  "to": "charles@allianceprocurementandcapacitybuilding.org",
  "subject": "🧪 Test Email",
  "html": "<h1>Hello!</h1><p>Your email system works!</p>"
}'
```

2. **Check Your Inbox:**
   - Look for the test email
   - Check spam folder if not in inbox
   - Email should arrive within 1-2 minutes

### Step 5: Update Your React App

The email service hook is already created. You just need to test it:

1. **Test Registration:**
   - Go to your app
   - Register for an event
   - Check if confirmation email arrives

2. **Monitor Function Logs:**
```bash
supabase functions logs send-email
```

## 🧪 Testing Checklist

### ✅ Email Functionality Tests

- [ ] **Registration Confirmation**
  - Register for an event
  - Confirmation email received
  - Email formatting looks professional
  - All event details are correct

- [ ] **Newsletter Sending** (Admin)
  - Login as admin
  - Send test newsletter
  - Verify delivery to subscribers

- [ ] **DNS Configuration**
  - Check domain verification in Resend dashboard
  - No delivery issues reported

- [ ] **Error Handling**
  - Registration works even if email fails
  - Proper error logging in console

### 🔍 Troubleshooting Common Issues

#### Problem: "Email service not configured"
**Solution:** Check if RESEND_API_KEY is set correctly
```bash
supabase secrets list
```

#### Problem: "Domain not verified"
**Solution:** 
1. Wait 24-48 hours for DNS propagation
2. Check DNS records in Namecheap
3. Verify domain in Resend dashboard

#### Problem: "Function deployment failed"
**Solution:**
1. Check you're in the correct directory
2. Ensure you're linked to the right project
3. Verify file structure exists

#### Problem: "Emails going to spam"
**Solution:**
1. Verify all DNS records are correct
2. Wait for domain reputation to build
3. Check DMARC policy alignment

## 📊 Monitoring & Analytics

### Resend Dashboard
- **Logs**: View all sent emails and delivery status
- **Analytics**: Open rates, click rates, bounces
- **Domain Health**: SPF, DKIM, DMARC status

### Supabase Function Logs
```bash
# View recent logs
supabase functions logs send-email

# Follow live logs
supabase functions logs send-email --follow
```

### Key Metrics to Monitor
- **Delivery Rate**: Should be >95%
- **Bounce Rate**: Should be <2%
- **Spam Rate**: Should be <0.1%
- **Function Errors**: Should be minimal

## 🚦 Email Limits & Scaling

### Free Tier Limits (Resend)
- **Daily**: 100 emails
- **Monthly**: 3,000 emails
- **Perfect for your current needs!**

### Scaling Options
When you exceed free limits:

1. **Resend Pro** - $20/month
   - 50,000 emails/month
   - Advanced analytics
   - Priority support

2. **SendGrid Alternative** - $19.95/month
   - 50,000 emails/month
   - Drag-and-drop editor
   - Marketing automation

## 📧 Email Templates

Your system includes professionally designed templates for:

### Registration Confirmation
- ✅ Branded header with your colors
- ✅ Event details clearly displayed
- ✅ Registration number highlighted
- ✅ Professional footer with contact info

### Newsletter
- ✅ Clean, readable design
- ✅ Multiple content sections
- ✅ Unsubscribe link included
- ✅ Mobile-responsive layout

### Admin Notifications
- ✅ New registration alerts
- ✅ Payment status updates
- ✅ Cancellation notifications

## 🔒 Security Best Practices

### API Key Security
- ✅ Stored in Supabase secrets (encrypted)
- ✅ Never exposed to client-side code
- ✅ Can be rotated without app redeployment

### Email Authentication
- ✅ SPF record prevents spoofing
- ✅ DKIM ensures message integrity
- ✅ DMARC provides policy enforcement

### Rate Limiting
- ✅ Batch sending prevents overwhelming
- ✅ Delays between batches
- ✅ Error handling for failed sends

## 🎯 Next Steps After Deployment

### Immediate (Day 1)
1. **Test all email functions**
2. **Monitor delivery rates**
3. **Check spam folder placement**
4. **Verify admin notifications work**

### Short-term (Week 1)
1. **Gather user feedback on emails**
2. **Monitor bounce rates**
3. **Adjust templates if needed**
4. **Set up email monitoring alerts**

### Long-term (Month 1+)
1. **Analyze email performance**
2. **A/B test subject lines**
3. **Consider email automation**
4. **Plan for scaling if needed**

## 📞 Support Resources

### Resend Support
- **Documentation**: [resend.com/docs](https://resend.com/docs)
- **API Reference**: [resend.com/docs/api-reference](https://resend.com/docs/api-reference)
- **Status Page**: [status.resend.com](https://status.resend.com)

### Supabase Support
- **Edge Functions**: [supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
- **CLI Reference**: [supabase.com/docs/reference/cli](https://supabase.com/docs/reference/cli)

### DNS & Domain
- **Namecheap Support**: [namecheap.com/support](https://www.namecheap.com/support/)
- **DNS Checker**: [dnschecker.org](https://dnschecker.org)
- **Email Tester**: [mail-tester.com](https://www.mail-tester.com)

## 🎉 You're All Set!

Your professional email system is now ready to:

✅ **Send beautiful registration confirmations**
✅ **Handle newsletter campaigns**  
✅ **Notify admins of important events**
✅ **Scale with your business growth**
✅ **Maintain high deliverability rates**

### Final Checklist
- [ ] Resend account created and domain added
- [ ] DNS records added to Namecheap
- [ ] Supabase function deployed successfully
- [ ] API key secret configured
- [ ] Test emails sent and received
- [ ] Registration flow tested end-to-end
- [ ] Admin email functions verified
- [ ] Monitoring systems in place

**🚀 Your email system is production-ready!**

---

*Built for Alliance Procurement & Capacity Building Ltd - Professional email delivery with Resend + Supabase*

## Quick Commands Reference

```bash
# Deploy function
supabase functions deploy send-email

# Test function
supabase functions invoke send-email --data '{"to":"test@example.com","subject":"Test","html":"<h1>Hello!</h1>"}'

# View logs
supabase functions logs send-email

# Set secret
supabase secrets set RESEND_API_KEY=your_key_here

# Check project status
supabase status
```

**Need help?** Contact your development team or refer to the support resources above.
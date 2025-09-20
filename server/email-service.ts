// Email service using direct Brevo API calls
interface EmailRecipient {
  email: string;
  name: string;
}

interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export interface UserRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface EventRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  eventTitle: string;
  eventDate: string | Date;
  registrationNumber: string;
  organization?: string;
  country?: string;
}

export interface EventCreationData {
  eventTitle: string;
  eventDescription: string;
  eventDate: string | Date;
  eventLocation: string;
  eventPrice: string;
}

class EmailService {
  private readonly apiKey: string;
  private readonly senderEmail: string;
  private readonly senderName: string;
  private readonly baseUrl = "https://api.brevo.com/v3";

  constructor() {
    this.apiKey =
      process.env.BREVO_API_KEY;
    this.senderEmail =
      process.env.BREVO_SENDER_EMAIL;
    this.senderName =
      process.env.BREVO_SENDER_NAME;

    if (!this.apiKey) {
      throw new Error("BREVO_API_KEY environment variable is required");
    }
  }

  /**
   * Make API request to Brevo
   */
  private async makeRequest(endpoint: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Brevo API Error (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error("Brevo API request failed:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send a single email
   */
  async sendEmail(
    to: EmailRecipient[],
    subject: string,
    htmlContent: string,
    textContent?: string,
    cc?: EmailRecipient[],
    bcc?: EmailRecipient[],
  ): Promise<void> {
    const emailData = {
      sender: {
        email: this.senderEmail,
        name: this.senderName,
      },
      to: to,
      subject: subject,
      htmlContent: htmlContent,
      textContent: textContent,
      cc: cc,
      bcc: bcc,
    };

    const result = await this.makeRequest("/smtp/email", emailData);
    console.log("📧 Email sent successfully:", result?.messageId || "sent");
  }

  /**
   * Send bulk emails to multiple recipients
   */
  async sendBulkEmails(
    recipients: EmailRecipient[],
    subject: string,
    htmlContent: string,
    textContent?: string,
  ): Promise<void> {
    // Brevo allows up to 50 recipients per email, so we'll batch them
    const batchSize = 50;
    const batches = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize));
    }

    const promises = batches.map((batch) =>
      this.sendEmail(batch, subject, htmlContent, textContent),
    );

    await Promise.all(promises);
    console.log(`📧 Bulk email sent to ${recipients.length} recipients`);
  }

  /**
   * Send welcome email to new user
   */
  async sendUserWelcomeEmail(userData: UserRegistrationData): Promise<void> {
    // Validate required fields
    if (!userData.email || !userData.firstName || !userData.lastName) {
      throw new Error(`Missing required user data: email=${userData.email}, firstName=${userData.firstName}, lastName=${userData.lastName}`);
    }
    
    const fullName = `${userData.firstName} ${userData.lastName}`;
    const userRole = userData.role.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
    
    const subject = "🎉 Welcome to Alliance Procurement & Capacity Building!";
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Alliance Procurement & Capacity Building</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #2D3748; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0; 
            padding: 20px;
            min-height: 100vh;
          }
          .email-wrapper {
            max-width: 650px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          }
          .header { 
            background: linear-gradient(135deg, #1C356B 0%, #2563eb 50%, #87CEEB 100%); 
            padding: 50px 40px; 
            text-align: center; 
            position: relative;
            overflow: hidden;
          }
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
          }
          .logo {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 20px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            backdrop-filter: blur(10px);
            position: relative;
            z-index: 2;
          }
          .header h1 { 
            color: #ffffff; 
            font-size: 32px; 
            font-weight: 800; 
            margin-bottom: 12px;
            letter-spacing: -0.5px;
            position: relative;
            z-index: 2;
          }
          .header .subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 18px;
            font-weight: 500;
            position: relative;
            z-index: 2;
          }
          .content { 
            padding: 50px 40px; 
          }
          .greeting {
            font-size: 24px;
            font-weight: 700;
            color: #1C356B;
            margin-bottom: 16px;
            text-align: center;
          }
          .intro-text {
            font-size: 18px;
            color: #4A5568;
            margin-bottom: 35px;
            line-height: 1.7;
            text-align: center;
          }
          .welcome-card { 
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); 
            padding: 30px; 
            border-radius: 16px; 
            border: 2px solid #87CEEB; 
            margin: 30px 0;
            position: relative;
            overflow: hidden;
          }
          .welcome-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #1C356B, #87CEEB, #1C356B);
          }
          .welcome-card h3 {
            color: #1C356B;
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .detail-grid {
            display: grid;
            gap: 15px;
          }
          .detail-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 20px;
            background: #ffffff;
            border-radius: 10px;
            border-left: 4px solid #87CEEB;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }
          .detail-label {
            font-weight: 600;
            color: #2D3748;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .detail-value {
            font-weight: 700;
            color: #1C356B;
            font-size: 16px;
          }
          .benefits {
            margin: 40px 0;
          }
          .benefits h3 {
            color: #1C356B;
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 25px;
            text-align: center;
          }
          .benefits-grid {
            display: grid;
            gap: 20px;
          }
          .benefit-item {
            display: flex;
            align-items: flex-start;
            gap: 15px;
            padding: 20px;
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border-radius: 12px;
            border-left: 4px solid #87CEEB;
            transition: transform 0.2s ease;
          }
          .benefit-item:hover {
            transform: translateY(-2px);
          }
          .benefit-icon {
            font-size: 24px;
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #1C356B, #87CEEB);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .benefit-text {
            color: #4A5568;
            font-size: 15px;
            line-height: 1.6;
            font-weight: 500;
          }
          .cta-section {
            text-align: center;
            margin: 40px 0;
            padding: 30px;
            background: linear-gradient(135deg, #1C356B 0%, #2563eb 100%);
            border-radius: 16px;
            color: white;
          }
          .cta-button {
            display: inline-block;
            background: #87CEEB;
            color: #1C356B;
            padding: 15px 30px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 700;
            font-size: 16px;
            transition: all 0.3s ease;
          }
          .cta-button:hover {
            background: #7bb8d4;
            transform: translateY(-2px);
          }
          .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer p {
            color: #718096;
            font-size: 14px;
            margin: 5px 0;
          }
          @media (max-width: 600px) {
            .content { padding: 30px 20px; }
            .header { padding: 40px 20px; }
            .greeting { font-size: 20px; }
            .intro-text { font-size: 16px; }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <div class="logo">🏢</div>
            <h1>Welcome Aboard!</h1>
            <p class="subtitle">Alliance Procurement & Capacity Building</p>
          </div>
          
          <div class="content">
            <div class="greeting">Hello ${fullName}! 👋</div>
            
            <div class="intro-text">
              We're absolutely thrilled to welcome you to the Alliance Procurement & Capacity Building community! 
              Your journey towards procurement excellence starts here.
            </div>

            <div class="welcome-card">
              <h3>🎯 Your Account Details</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Full Name</span>
                  <span class="detail-value">${fullName}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Email Address</span>
                  <span class="detail-value">${userData.email}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Account Role</span>
                  <span class="detail-value">${userRole}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email Address:</span>
          <span class="detail-value">${userData.email}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Account Role:</span>
          <span class="detail-value">${userData.role.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
        </div>
      </div>

      <div class="benefits">
        <h3>🚀 What You Can Access</h3>
        <div class="benefits-grid">
          <div class="benefit-item">
            <div class="benefit-icon">🎯</div>
            <div class="benefit-text">Exclusive procurement training workshops and certification programs</div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">📚</div>
            <div class="benefit-text">Comprehensive capacity building resources and learning materials</div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">🤝</div>
            <div class="benefit-text">Networking opportunities with industry professionals and experts</div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">📅</div>
            <div class="benefit-text">Early access to upcoming events, seminars, and conferences</div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">💼</div>
            <div class="benefit-text">Professional development opportunities and career advancement</div>
          </div>
        </div>
      </div>

      <div class="cta-section">
        <h3 style="color: white; margin-bottom: 15px;">Ready to Get Started?</h3>
        <p style="color: rgba(255,255,255,0.9); margin-bottom: 25px;">
          Explore our platform and discover all the amazing resources waiting for you!
        </p>
        <a href="#" class="cta-button">Explore Platform</a>
      </div>

      <div style="margin-top: 30px; color: #4A5568; font-size: 15px; line-height: 1.6;">
        <p style="margin-bottom: 15px;">
          We encourage you to explore our platform and take advantage of all the resources available to you. 
          Our team is here to support your professional growth and development.
        </p>
        
        <p style="margin-bottom: 15px;">
          If you have any questions or need assistance, please don't hesitate to reach out to our support team.
        </p>

          <div class="cta-section">
            <h3 style="color: white; margin-bottom: 15px;">Ready to Get Started?</h3>
            <p style="color: rgba(255,255,255,0.9); margin-bottom: 25px;">
              Explore our platform and discover all the amazing resources waiting for you!
            </p>
            <a href="#" class="cta-button">Explore Platform</a>
          </div>

          <div style="margin-top: 30px; color: #4A5568; font-size: 15px; line-height: 1.6;">
            <p style="margin-bottom: 15px;">
              We encourage you to explore our platform and take advantage of all the resources available to you. 
              Our team is here to support your professional growth and development.
            </p>
            
            <p style="margin-bottom: 15px;">
              If you have any questions or need assistance, please don't hesitate to reach out to our support team.
            </p>
            
            <p style="font-weight: 600; color: #1C356B;">
              Welcome to the Alliance family! 🎉
            </p>
          </div>
        </div>

        <div class="footer">
          <p><strong>Alliance Procurement & Capacity Building</strong></p>
          <p>Building Excellence in Procurement & Supply Chain Management</p>
          <p style="margin-top: 15px;">This email was sent to ${userData.email}</p>
          <p style="opacity: 0.7;">&copy; 2024 Alliance Procurement & Capacity Building. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
`;

const textContent = `
Welcome to Alliance Procurement & Capacity Building!

Hello ${fullName},

We're thrilled to welcome you to our community! Your journey towards procurement excellence starts here.

Your Account Details:
- Full Name: ${fullName}
- Email Address: ${userData.email}
- Account Role: ${userRole}

What You Can Access:
- Exclusive procurement training workshops and certification programs
- Comprehensive capacity building resources and learning materials
- Networking opportunities with industry professionals and experts
- Early access to upcoming events, seminars, and conferences
- Professional development opportunities and career advancement

Ready to Get Started?
Explore our platform and discover all the amazing resources waiting for you!

Best regards,
Alliance Procurement & Capacity Building Team
`;

    await this.sendEmail(
      [{
        email: userData.email,
        name: fullName,
      }],
      subject,
      htmlContent,
      textContent,
    );
  }

  /**
   * Send event registration confirmation email
   */
  async sendEventRegistrationConfirmation(
    eventData: EventRegistrationData,
  ): Promise<void> {
    const subject = `Registration Confirmed: ${eventData.eventTitle}`;
    const eventDate =
      typeof eventData.eventDate === "string"
        ? new Date(eventData.eventDate)
        : eventData.eventDate;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Registration Confirmation</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      line-height: 1.6; 
      color: #2D3748; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0; 
      padding: 20px;
      min-height: 100vh;
    }
    .email-wrapper {
      max-width: 650px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    }
    .header { 
      background: linear-gradient(135deg, #1C356B 0%, #3B82F6 30%, #10B981 70%, #87CEEB 100%); 
      padding: 50px 40px; 
      text-align: center; 
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="sparkle" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1" fill="rgba(255,255,255,0.2)"/><circle cx="15" cy="15" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23sparkle)"/></svg>');
      animation: sparkle 20s linear infinite;
    }
    @keyframes sparkle {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .celebration-icon {
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, #10B981, #34D399);
      border-radius: 50%;
      margin: 0 auto 25px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      position: relative;
      z-index: 2;
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
      animation: bounce 2s ease-in-out infinite;
    }
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-10px); }
      60% { transform: translateY(-5px); }
    }
    .header h1 {
      color: white;
      font-size: 36px;
      font-weight: 800;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
      position: relative;
      z-index: 2;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header .subtitle {
      color: rgba(255, 255, 255, 0.95);
      font-size: 18px;
      font-weight: 600;
      position: relative;
      z-index: 2;
    }
    .content { 
      padding: 50px 40px; 
    }
    .greeting {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #1C356B, #3B82F6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 20px;
      text-align: center;
    }
    .intro-text {
      font-size: 18px;
      color: #4A5568;
      margin-bottom: 35px;
      line-height: 1.7;
      text-align: center;
    }
    .success-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #10B981, #34D399);
      color: white;
      padding: 12px 24px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      margin: 0 auto 30px;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }
    .event-details {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 35px;
      border-radius: 20px;
      border: 3px solid transparent;
      background-clip: padding-box;
      margin: 35px 0;
      position: relative;
      overflow: hidden;
    }
    .event-details::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, #1C356B, #3B82F6, #10B981, #87CEEB);
    }
    .event-details h3 {
      color: #1C356B;
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 25px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .detail-grid {
      display: grid;
      gap: 18px;
    }
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 25px;
      background: #ffffff;
      border-radius: 12px;
      border-left: 5px solid #10B981;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .detail-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    }
    .detail-label {
      font-weight: 600;
      color: #2D3748;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .detail-value {
      font-weight: 700;
      color: #1C356B;
      font-size: 16px;
      text-align: right;
    }
    .highlight-box {
      background: linear-gradient(135deg, #1C356B 0%, #3B82F6 100%);
      color: white;
      padding: 30px;
      border-radius: 16px;
      margin: 35px 0;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .highlight-box::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, #10B981, #3B82F6, #87CEEB, #10B981);
      border-radius: 18px;
      z-index: -1;
      animation: borderGlow 3s ease-in-out infinite alternate;
    }
    @keyframes borderGlow {
      0% { opacity: 0.5; }
      100% { opacity: 1; }
    }
    .highlight-box h4 {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 15px;
    }
    .cta-section {
      text-align: center;
      margin: 40px 0;
      padding: 35px;
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      border-radius: 20px;
      border: 2px dashed #87CEEB;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #10B981, #34D399);
      color: white;
      padding: 16px 32px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 700;
      font-size: 16px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }
    .cta-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
    }
    .footer {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 40px 30px;
      text-align: center;
      border-top: 3px solid #87CEEB;
    }
    .footer p {
      color: #718096;
      font-size: 14px;
      margin: 8px 0;
    }
    .footer .company-name {
      font-weight: 700;
      color: #1C356B;
      font-size: 16px;
    }
    @media (max-width: 600px) {
      .content { padding: 30px 20px; }
      .header { padding: 40px 20px; }
      .greeting { font-size: 24px; }
      .intro-text { font-size: 16px; }
      .event-details { padding: 25px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="celebration-icon">🎉</div>
      <h1>Registration Confirmed!</h1>
      <p class="subtitle">Alliance Procurement & Capacity Building</p>
    </div>
    
    <div class="content">
      <div class="greeting">Hello ${eventData.firstName} ${eventData.lastName}! 👋</div>
      
      <div style="text-align: center; margin-bottom: 30px;">
        <div class="success-badge">
          ✅ Successfully Registered
        </div>
      </div>
      
      <div class="intro-text">
        Fantastic news! Your registration for <strong style="color: #1C356B;">${eventData.eventTitle}</strong> has been confirmed. 
        We're absolutely thrilled to have you join us for this transformative learning experience!
      </div>

      <div class="event-details">
        <h3>🎯 Your Event Details</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Event Title</span>
            <span class="detail-value">${eventData.eventTitle}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Date & Time</span>
            <span class="detail-value">${eventDate.toLocaleDateString()} at ${eventDate.toLocaleTimeString()}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Registration #</span>
            <span class="detail-value">${eventData.registrationNumber}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Participant</span>
            <span class="detail-value">${eventData.firstName} ${eventData.lastName}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Email</span>
            <span class="detail-value">${eventData.email}</span>
          </div>
          ${eventData.organization ? `
          <div class="detail-item">
            <span class="detail-label">Organization</span>
            <span class="detail-value">${eventData.organization}</span>
          </div>` : ''}
          ${eventData.country ? `
          <div class="detail-item">
            <span class="detail-label">Country</span>
            <span class="detail-value">${eventData.country}</span>
          </div>` : ''}
        </div>
      </div>

      <div class="highlight-box">
        <h4>🚀 What's Next?</h4>
        <p style="margin-bottom: 20px; font-size: 16px; line-height: 1.6;">
          Keep this confirmation safe! We'll send you detailed event information, 
          including location details and preparation materials, closer to the event date.
        </p>
        <div style="display: flex; align-items: center; justify-content: center; gap: 15px; flex-wrap: wrap;">
          <span style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 14px;">📧 Event Reminders</span>
          <span style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 14px;">📋 Pre-event Materials</span>
          <span style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 14px;">🎯 Networking Opportunities</span>
        </div>
      </div>

      <div class="cta-section">
        <h4 style="color: #1C356B; margin-bottom: 15px; font-size: 20px;">Need to Make Changes?</h4>
        <p style="color: #4A5568; margin-bottom: 25px; font-size: 16px;">
          If you need to modify your registration or have any questions about the event, 
          we're here to help! Contact us as soon as possible.
        </p>
        <a href="mailto:chisalecharles23@gmail.com" class="cta-button">Contact Support</a>
      </div>

      <div style="margin-top: 35px; color: #4A5568; font-size: 16px; line-height: 1.7; text-align: center;">
        <p style="margin-bottom: 20px;">
          We're committed to delivering an exceptional learning experience that will advance your 
          procurement and capacity building expertise. Get ready for an inspiring and productive event!
        </p>
        
        <p style="font-weight: 600; color: #1C356B; font-size: 18px;">
          Thank you for choosing Alliance Procurement & Capacity Building! 🌟
        </p>
      </div>
    </div>

    <div class="footer">
      <p class="company-name">Alliance Procurement & Capacity Building</p>
      <p style="font-weight: 500; color: #4A5568;">Building Excellence in Procurement & Supply Chain Management</p>
      <p style="margin-top: 20px;">This confirmation was sent to ${eventData.email}</p>
      <p style="opacity: 0.7;">© 2024 Alliance Procurement & Capacity Building. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

    const textContent = `Event Registration Confirmation

Hello ${eventData.firstName} ${eventData.lastName},

Great news! Your registration for "${eventData.eventTitle}" has been confirmed.

Event Details:
- Event Title: ${eventData.eventTitle}
- Date & Time: ${eventDate.toLocaleDateString()} at ${eventDate.toLocaleTimeString()}
- Registration Number: ${eventData.registrationNumber}
- Participant: ${eventData.firstName} ${eventData.lastName}
- Email: ${eventData.email}

Please save this confirmation email for your records. If you need to make any changes to your registration or have questions about the event, please contact us as soon as possible.

We look forward to seeing you at the event and helping you advance your procurement and capacity building expertise!

Thank you for choosing Alliance Procurement & Capacity Building!

Best regards,
Alliance Procurement & Capacity Building Team

This confirmation was sent to ${eventData.email}`;

    try {
      await this.sendEmail(
        [{
          email: eventData.email,
          name: `${eventData.firstName} ${eventData.lastName}`,
        }],
        subject,
        htmlContent,
        textContent,
      );
      console.log(`Event registration confirmation sent to ${eventData.email}`);
    } catch (error) {
      console.error("Failed to send event registration confirmation:", error);
      throw error;
    }
  }

  /**
   * Notify super admins about new user registration
   */
  async notifyAdminsNewUserRegistration(
    userData: UserRegistrationData,
    adminEmails: EmailRecipient[],
  ): Promise<void> {
    const subject = `New User Registration: ${userData.firstName} ${userData.lastName}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New User Registration Alert</title>
        <style>
          body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #dc3545, #fd7e83); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; margin: -30px -30px 30px -30px; }
          .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
          .content { color: #333; line-height: 1.6; }
          .user-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New User Registration</h1>
          </div>
          <div class="content">
            <h2>Admin Notification</h2>

            <p>A new user has registered on the Alliance Procurement & Capacity Building platform.</p>

            <div class="user-details">
              <h3>User Information:</h3>
              <p><strong>Name:</strong> ${userData.firstName} ${userData.lastName}</p>
              <p><strong>Email:</strong> ${userData.email}</p>
              <p><strong>Role:</strong> ${userData.role.replace("_", " ").toUpperCase()}</p>
              <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <p>Please review the new user registration and take any necessary actions through the admin dashboard.</p>

            <p>Best regards,<br>
            <strong>System Notification</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Alliance Procurement & Capacity Building. All rights reserved.</p>
            <p>This is an automated admin notification</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(adminEmails, subject, htmlContent);
  }

  /**
   * Notify super admins about new event registration
   */
  async notifyAdminsNewEventRegistration(
    eventData: EventRegistrationData,
    adminEmails: EmailRecipient[],
  ): Promise<void> {
    const subject = `New Event Registration: ${eventData.eventTitle}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Event Registration Alert</title>
        <style>
          body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #28a745, #5cbf6a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; margin: -30px -30px 30px -30px; }
          .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
          .content { color: #333; line-height: 1.6; }
          .registration-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 New Event Registration</h1>
          </div>
          <div class="content">
            <h2>Admin Notification</h2>

            <p>A new event registration has been submitted.</p>

            <div class="registration-details">
              <h3>Registration Details:</h3>
              <p><strong>Participant:</strong> ${eventData.firstName} ${eventData.lastName}</p>
              <p><strong>Email:</strong> ${eventData.email}</p>
              <p><strong>Event:</strong> ${eventData.eventTitle}</p>
              <p><strong>Registration Number:</strong> ${eventData.registrationNumber}</p>
              ${eventData.organization ? `<p><strong>Organization:</strong> ${eventData.organization}</p>` : ""}
              ${eventData.country ? `<p><strong>Country:</strong> ${eventData.country}</p>` : ""}
              <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <p>Please review the registration details and process payment confirmation through the admin dashboard.</p>

            <p>Best regards,<br>
            <strong>System Notification</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Alliance Procurement & Capacity Building. All rights reserved.</p>
            <p>Registration Number: ${eventData.registrationNumber}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(adminEmails, subject, htmlContent);
  }

  /**
   * Send sponsorship application confirmation email
   */
  async sendSponsorshipConfirmation(sponsorshipData: {
    companyName: string;
    contactPerson: string;
    email: string;
    sponsorshipLevel: string;
    amount: number;
    eventTitle: string;
    eventDate: string;
  }): Promise<void> {
    const subject = `Sponsorship Application Received - ${sponsorshipData.eventTitle}`;
    
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sponsorship Application Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1C356B 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Sponsorship Application Received!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for your interest in partnering with us</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 18px; margin-bottom: 20px;">Dear ${sponsorshipData.contactPerson},</p>
            
            <p>We have successfully received your sponsorship application for <strong>${sponsorshipData.eventTitle}</strong>. Thank you for your interest in partnering with us!</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1C356B;">
                <h3 style="margin-top: 0; color: #1C356B;">Application Details:</h3>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin: 8px 0;"><strong>Company:</strong> ${sponsorshipData.companyName}</li>
                    <li style="margin: 8px 0;"><strong>Sponsorship Level:</strong> ${sponsorshipData.sponsorshipLevel.charAt(0).toUpperCase() + sponsorshipData.sponsorshipLevel.slice(1)}</li>
                    <li style="margin: 8px 0;"><strong>Investment:</strong> $${sponsorshipData.amount.toLocaleString()} USD</li>
                    <li style="margin: 8px 0;"><strong>Event:</strong> ${sponsorshipData.eventTitle}</li>
                    <li style="margin: 8px 0;"><strong>Event Date:</strong> ${sponsorshipData.eventDate}</li>
                </ul>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #1565c0;">What happens next?</h4>
                <ol style="margin: 0; padding-left: 20px;">
                    <li>Our partnerships team will review your application within 2 business days</li>
                    <li>We'll contact you to discuss sponsorship benefits and finalize details</li>
                    <li>Upon approval, we'll send you the sponsorship agreement and payment instructions</li>
                    <li>Your company will be featured as an official sponsor once payment is confirmed</li>
                </ol>
            </div>
            
            <p>If you have any questions or need to make changes to your application, please don't hesitate to contact us.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <p style="margin: 0; color: #666;">Thank you for choosing to partner with us!</p>
                <p style="margin: 5px 0 0 0; font-weight: bold; color: #1C356B;">Alliance Procurement & Capacity Building Team</p>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #666; font-size: 12px;">
            <p>This is an automated confirmation email. Please do not reply to this email.</p>
            <p>For inquiries, contact us at globaltrainingalliance@gmail.com</p>
        </div>
    </body>
    </html>`;

    await this.sendEmail(
      [{
        email: sponsorshipData.email,
        name: sponsorshipData.contactPerson,
      }],
      subject,
      htmlContent
    );
  }

  /**
   * Send exhibition application confirmation email
   */
  async sendExhibitionConfirmation(exhibitionData: {
    companyName: string;
    contactPerson: string;
    email: string;
    amount: number;
    eventTitle: string;
    eventDate: string;
  }): Promise<void> {
    const subject = `Exhibition Application Received - ${exhibitionData.eventTitle}`;
    
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Exhibition Application Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Exhibition Application Received!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for your interest in exhibiting with us</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 18px; margin-bottom: 20px;">Dear ${exhibitionData.contactPerson},</p>
            
            <p>We have successfully received your exhibition application for <strong>${exhibitionData.eventTitle}</strong>. Thank you for your interest in showcasing your products and services at our event!</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <h3 style="margin-top: 0; color: #dc2626;">Application Details:</h3>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin: 8px 0;"><strong>Company:</strong> ${exhibitionData.companyName}</li>
                    <li style="margin: 8px 0;"><strong>Exhibition Package:</strong> Professional Exhibition Booth</li>
                    <li style="margin: 8px 0;"><strong>Investment:</strong> $${exhibitionData.amount.toLocaleString()} USD</li>
                    <li style="margin: 8px 0;"><strong>Event:</strong> ${exhibitionData.eventTitle}</li>
                    <li style="margin: 8px 0;"><strong>Event Date:</strong> ${exhibitionData.eventDate}</li>
                </ul>
            </div>
            
            <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #dc2626;">What happens next?</h4>
                <ol style="margin: 0; padding-left: 20px;">
                    <li>Our events team will review your application within 2 business days</li>
                    <li>We'll contact you to discuss booth requirements and setup details</li>
                    <li>Upon approval, we'll send you the exhibition agreement and payment instructions</li>
                    <li>Your booth space will be reserved once payment is confirmed</li>
                </ol>
            </div>
            
            <p>If you have any questions about booth setup, electrical requirements, or need to make changes to your application, please don't hesitate to contact us.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <p style="margin: 0; color: #666;">Thank you for choosing to exhibit with us!</p>
                <p style="margin: 5px 0 0 0; font-weight: bold; color: #dc2626;">Alliance Procurement & Capacity Building Team</p>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #666; font-size: 12px;">
            <p>This is an automated confirmation email. Please do not reply to this email.</p>
            <p>For inquiries, contact us at globaltrainingalliance@gmail.com</p>
        </div>
    </body>
    </html>`;

    await this.sendEmail(
      [{
        email: exhibitionData.email,
        name: exhibitionData.contactPerson,
      }],
      subject,
      htmlContent
    );
  }

  /**
   * Send custom email campaign to selected user groups
   */
  async sendCampaignEmail(
    recipients: EmailRecipient[],
    subject: string,
    htmlContent: string,
    textContent?: string,
  ): Promise<void> {
    await this.sendBulkEmails(recipients, subject, htmlContent, textContent);
  }

  /**
   * Send event creation notification to all users
   */
  async sendEventCreationNotification(
    eventData: EventCreationData,
    recipients: EmailRecipient[]
  ): Promise<void> {
    const subject = `New Event: ${eventData.eventTitle}`;
    
    const htmlContent = this.generateCampaignTemplate(
      `New Event: ${eventData.eventTitle}`,
      `
        <p>We're excited to announce a new event:</p>
        
        <div class="card" style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #87CEEB;">
          <h2 style="color: #1C356B; margin-top: 0;">${eventData.eventTitle}</h2>
          <p>${eventData.eventDescription}</p>
          <div style="margin-top: 15px;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>${new Date(eventData.eventDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div style="display: flex; align-items: center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>${eventData.eventLocation}</span>
            </div>
          </div>
          ${eventData.eventPrice ? `
            <div style="margin-top: 15px; font-weight: 600; color: #1C356B;">
              Price: K${eventData.eventPrice}
            </div>
          ` : ''}
        </div>
        
        <p>We look forward to seeing you there!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'https://your-website.com'}/events" 
             style="display: inline-block; background: #1C356B; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin: 10px 0;">
            View Event Details
          </a>
        </div>
        
        <p style="margin-top: 25px; color: #1C356B; font-weight: 500;">
          Best regards,<br>
          <strong>Alliance Procurement & Capacity Building Team</strong>
        </p>
      `,
      `New event announcement: ${eventData.eventTitle} on ${new Date(eventData.eventDate).toLocaleDateString()}`
    );

    await this.sendBulkEmails(recipients, subject, htmlContent);
  }

  /**
   * Generate a modern, responsive HTML email template with professional design
   */
  public generateCampaignTemplate(
    title: string,
    content: string,
    preheader?: string
  ): string {
    const year = new Date().getFullYear();
    
    return `
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="x-apple-disable-message-reformatting">
      <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
      <title>${title}</title>
      ${preheader ? `<meta name="description" content="${preheader}">` : ''}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style type="text/css">
        /* Base Styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
        }
        
        body {
          width: 100% !important;
          margin: 0;
          padding: 0;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
          background-color: #f5f7fa;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #2d3748;
        }
        
        /* Layout */
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
        }
        
        /* Header */
        .header {
          background: linear-gradient(135deg, #1C356B 0%, #2d4a8a 100%);
          padding: 40px 30px 30px;
          text-align: center;
          position: relative;
          border-bottom: 4px solid #87CEEB;
        }
        
        .logo {
          max-width: 180px;
          height: auto;
          margin: 0 auto 20px;
          display: block;
        }
        
        .header h1 {
          color: #ffffff;
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 10px;
          line-height: 1.3;
          letter-spacing: -0.02em;
        }
        
        .preheader {
          display: none;
          font-size: 1px;
          line-height: 1px;
          max-height: 0;
          max-width: 0;
          opacity: 0;
          overflow: hidden;
          mso-hide: all;
        }
        
        /* Content */
        .content {
          padding: 40px 30px;
          color: #4a5568;
          font-size: 16px;
          line-height: 1.7;
        }
        
        .content-inner {
          max-width: 520px;
          margin: 0 auto;
        }
        
        .content h2 {
          color: #2d3748;
          font-size: 22px;
          font-weight: 600;
          margin: 30px 0 20px;
        }
        
        .content h3 {
          color: #2d3748;
          font-size: 18px;
          font-weight: 600;
          margin: 25px 0 15px;
        }
        
        .content p {
          margin-bottom: 20px;
        }
        
        .content a {
          color: #1C356B;
          text-decoration: underline;
        }
        
        /* Cards & Highlights */
        .card {
          background: #f8fafc;
          border-radius: 8px;
          padding: 25px;
          margin: 25px 0;
          border-left: 4px solid #87CEEB;
        }
        
        .highlight-box {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
          border: 1px solid #bae6fd;
        }
        
        /* Buttons */
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #1C356B 0%, #2d4a8a 100%);
          color: #ffffff !important;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 15px;
          line-height: 1.5;
          text-align: center;
          margin: 10px 0;
          transition: all 0.3s ease;
        }
        
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(28, 53, 107, 0.15);
        }
        
        .btn-secondary {
          background: #f1f5f9;
          color: #1C356B !important;
        }
        
        /* Footer */
        .footer {
          background-color: #f8fafc;
          padding: 30px;
          text-align: center;
          font-size: 14px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
        
        .footer p {
          margin: 0 0 10px;
          line-height: 1.6;
        }
        
        .social-links {
          margin: 20px 0;
        }
        
        .social-link {
          display: inline-block;
          margin: 0 10px;
          color: #64748b;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s ease;
        }
        
        .social-link:hover {
          color: #1C356B;
        }
        
        .copyright {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 20px;
        }
        
        .divider {
          height: 1px;
          background-color: #e2e8f0;
          margin: 30px 0;
          border: none;
        }
        
        /* Responsive */
        @media only screen and (max-width: 600px) {
          .header {
            padding: 30px 20px 25px;
          }
          
          .header h1 {
            font-size: 24px;
          }
          
          .content {
            padding: 30px 20px;
          }
          
          .btn {
            width: 100%;
            padding: 14px 20px;
          }
          
          .card, .highlight-box {
            padding: 20px 15px;
          }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          body, .email-container {
            background-color: #1a202c !important;
            color: #e2e8f0 !important;
          }
          
          .content, .footer {
            background-color: #2d3748 !important;
          }
          
          .content p, .footer p {
            color: #e2e8f0 !important;
          }
          
          .content h2, .content h3 {
            color: #ffffff !important;
          }
          
          .card {
            background-color: #2d3748 !important;
            border-left-color: #4a5568 !important;
          }
          
          .highlight-box {
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%) !important;
            border-color: #3b82f6 !important;
          }
          
          .btn-secondary {
            background: #4a5568 !important;
            color: #ffffff !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f7fa; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
      ${preheader ? `<span class="preheader" style="display: none; max-height: 0; overflow: hidden; mso-hide: all; visibility: hidden;">${preheader}</span>` : ''}
      
      <!-- Email Container -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 0; width: 100%; background-color: #f5f7fa;">
        <tr>
          <td align="center" style="padding: 30px 20px;">
            <!--[if (gte mso 9)|(IE)]>
            <table role="presentation" width="600" align="center" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td>
            <![endif]-->
            
            <div class="email-container" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);">
              <!-- Header -->
              <div class="header" style="background: linear-gradient(135deg, #1C356B 0%, #2d4a8a 100%); padding: 40px 30px 30px; text-align: center; position: relative; border-bottom: 4px solid #87CEEB;">
                <img src="https://your-logo-url-here.com/logo.png" alt="Alliance Procurement & Capacity Building" class="logo" style="max-width: 180px; height: auto; margin: 0 auto 20px; display: block;">
                <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 10px; line-height: 1.3; letter-spacing: -0.02em;">${title}</h1>
              </div>
              
              <!-- Content -->
              <div class="content" style="padding: 40px 30px; color: #4a5568; font-size: 16px; line-height: 1.7;">
                <div class="content-inner" style="max-width: 520px; margin: 0 auto;">
                  ${content}
                </div>
              </div>
              
              <!-- Footer -->
              <div class="footer" style="background-color: #f8fafc; padding: 30px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0;">
                <div class="social-links" style="margin: 20px 0;">
                  <a href="https://twitter.com/allianceprocure" class="social-link" style="display: inline-block; margin: 0 10px; color: #64748b; text-decoration: none; font-size: 14px; transition: color 0.3s ease;">Twitter</a>
                  <a href="https://linkedin.com/company/alliance-procurement" class="social-link" style="display: inline-block; margin: 0 10px; color: #64748b; text-decoration: none; font-size: 14px; transition: color 0.3s ease;">LinkedIn</a>
                  <a href="https://facebook.com/allianceprocurement" class="social-link" style="display: inline-block; margin: 0 10px; color: #64748b; text-decoration: none; font-size: 14px; transition: color 0.3s ease;">Facebook</a>
                </div>
                <p style="margin: 0 0 10px; line-height: 1.6;">Alliance Procurement & Capacity Building</p>
                <p style="margin: 0 0 10px; line-height: 1.6;">Building Excellence in Procurement & Supply Chain Management</p>
                <p class="copyright" style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
                  &copy; ${year} Alliance Procurement & Capacity Building. All rights reserved.
                </p>
                <p style="margin: 20px 0 0; font-size: 12px; color: #94a3b8;">
                  <a href="#" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a> | 
                  <a href="#" style="color: #94a3b8; text-decoration: underline;">Privacy Policy</a> | 
                  <a href="#" style="color: #94a3b8; text-decoration: underline;">Contact Us</a>
                </p>
              </div>
            </div>
            
            <!--[if (gte mso 9)|(IE)]>
                </td>
              </tr>
            </table>
            <![endif]-->
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
  }
}

export const emailService = new EmailService();
export default emailService;

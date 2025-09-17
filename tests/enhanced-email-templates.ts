/**
 * Enhanced Email Templates with Improved Headers and Footers
 * Uses the project's color scheme and handshake icon as logo
 */

export const enhancedEmailStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
    line-height: 1.6; 
    color: #1C356B; 
    background: linear-gradient(135deg, #EFF8FF 0%, #f0f9ff 50%, #e0f2fe 100%); 
    margin: 0; 
    padding: 20px;
    min-height: 100vh;
  }
  .email-container { 
    max-width: 600px; 
    margin: 0 auto; 
    background-color: #FEFFFE; 
    border-radius: 16px; 
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(28, 53, 107, 0.12), 0 8px 16px rgba(135, 206, 235, 0.08);
    border: 1px solid rgba(135, 206, 235, 0.2);
  }
  
  /* Enhanced Header Styles */
  .header { 
    background: linear-gradient(135deg, #0f1e3d 0%, #1C356B 30%, #2d4a7a 70%, #87CEEB 100%); 
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
    background: radial-gradient(circle, rgba(135, 206, 235, 0.1) 0%, transparent 70%);
    animation: float 6s ease-in-out infinite;
  }
  .header::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 20px;
    background: linear-gradient(135deg, transparent 0%, rgba(135, 206, 235, 0.3) 50%, transparent 100%);
    border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  }
  .logo-container {
    position: relative;
    z-index: 2;
    margin-bottom: 20px;
  }
  .logo {
    width: 64px;
    height: 64px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  .handshake-icon {
    width: 32px;
    height: 32px;
    fill: none;
    stroke: #87CEEB;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .company-name {
    color: #FEFFFE;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 1px;
    margin-bottom: 8px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .header h1 { 
    color: #FEFFFE; 
    font-size: 32px; 
    font-weight: 700; 
    margin-bottom: 12px;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    position: relative;
    z-index: 2;
  }
  
  /* Content Styles */
  .content { 
    padding: 40px 30px; 
  }
  .greeting {
    font-size: 20px;
    font-weight: 600;
    color: #1C356B;
    margin-bottom: 20px;
  }
  .intro-text {
    font-size: 16px;
    color: #282827;
    margin-bottom: 30px;
    line-height: 1.7;
  }
  .account-details, .event-details { 
    background: linear-gradient(135deg, #EFF8FF 0%, rgba(135, 206, 235, 0.1) 100%); 
    padding: 25px; 
    border-radius: 8px; 
    border-left: 4px solid #87CEEB; 
    margin: 25px 0;
  }
  .cta-button {
    display: inline-block;
    background: linear-gradient(135deg, #1C356B 0%, #87CEEB 100%);
    color: #FEFFFE;
    text-decoration: none;
    padding: 14px 28px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 16px;
    margin: 20px 0;
    transition: transform 0.2s ease;
  }
  .cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(28, 53, 107, 0.3);
  }
  
  /* Enhanced Footer Styles */
  .footer { 
    background: linear-gradient(135deg, #0f1e3d 0%, #1C356B 50%, #2d4a7a 100%); 
    color: #FEFFFE; 
    padding: 40px 30px; 
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, #87CEEB 50%, transparent 100%);
  }
  .footer-content {
    position: relative;
    z-index: 2;
  }
  .footer-logo {
    width: 48px;
    height: 48px;
    background: rgba(135, 206, 235, 0.15);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(135, 206, 235, 0.3);
  }
  .footer-handshake {
    width: 24px;
    height: 24px;
    fill: none;
    stroke: #87CEEB;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .footer-company {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
    background: linear-gradient(135deg, #FEFFFE 0%, #87CEEB 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .footer-tagline {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 20px;
    font-style: italic;
  }
  .footer-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(135, 206, 235, 0.4) 50%, transparent 100%);
    margin: 20px 0;
  }
  .footer-links {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .footer-link {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    transition: color 0.3s ease;
    padding: 4px 8px;
    border-radius: 4px;
  }
  .footer-link:hover {
    color: #87CEEB;
    background: rgba(135, 206, 235, 0.1);
  }
  .footer-copyright {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 8px;
  }
  .footer-contact {
    font-size: 12px;
    color: rgba(135, 206, 235, 0.8);
    font-weight: 500;
  }
  
  /* Animations */
  @keyframes float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(10px, -10px) rotate(1deg); }
    66% { transform: translate(-5px, 5px) rotate(-1deg); }
  }
  
  /* Mobile Responsiveness */
  @media (max-width: 600px) {
    .email-container { margin: 10px; }
    .header, .content, .footer { padding: 30px 20px; }
    .header h1 { font-size: 28px; }
    .company-name { font-size: 14px; }
    .footer-links { gap: 16px; }
  }
`;

export const enhancedHeader = `
  <div class="header">
    <div class="logo-container">
      <div class="logo">
        <svg class="handshake-icon" viewBox="0 0 24 24">
          <path d="m11 17 2 2a1 1 0 1 0 3-3"/>
          <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/>
          <path d="m21 3 1 11h-2"/>
          <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/>
          <path d="M3 4h8.28a2 2 0 0 1 1.42.59l.28.28"/>
        </svg>
      </div>
      <div class="company-name">ALLIANCE PROCUREMENT & CAPACITY BUILDING</div>
    </div>
    <h1>{{TITLE}}</h1>
  </div>
`;

export const enhancedFooter = `
  <div class="footer">
    <div class="footer-content">
      <div class="footer-logo">
        <svg class="footer-handshake" viewBox="0 0 24 24">
          <path d="m11 17 2 2a1 1 0 1 0 3-3"/>
          <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/>
          <path d="m21 3 1 11h-2"/>
          <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/>
          <path d="M3 4h8.28a2 2 0 0 1 1.42.59l.28.28"/>
        </svg>
      </div>
      <div class="footer-company">ALLIANCE PROCUREMENT & CAPACITY BUILDING</div>
      <div class="footer-tagline">Building partnerships, enhancing capabilities</div>
      <div class="footer-divider"></div>
      <div class="footer-links">
        <a href="#" class="footer-link">About Us</a>
        <a href="#" class="footer-link">Services</a>
        <a href="#" class="footer-link">Events</a>
        <a href="#" class="footer-link">Contact</a>
      </div>
      <div class="footer-copyright">© ${new Date().getFullYear()} Alliance Procurement & Capacity Building. All rights reserved.</div>
      <div class="footer-contact">globaltrainingalliance@gmail.com</div>
    </div>
  </div>
`;

export function createEnhancedEmailTemplate(title: string, content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        ${enhancedEmailStyles}
      </style>
    </head>
    <body>
      <div class="email-container">
        ${enhancedHeader.replace('{{TITLE}}', title)}
        <div class="content">
          ${content}
        </div>
        ${enhancedFooter}
      </div>
    </body>
    </html>
  `;
}

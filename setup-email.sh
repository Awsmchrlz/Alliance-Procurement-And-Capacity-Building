#!/bin/bash

# Setup script for Resend Email Integration with Supabase
# Alliance Procurement & Capacity Building Ltd

echo "🚀 Setting up Resend Email Integration..."
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js and npm are installed${NC}"

# Install Supabase CLI if not present
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI not found. Installing...${NC}"
    npm install -g supabase
    echo -e "${GREEN}✅ Supabase CLI installed${NC}"
else
    echo -e "${GREEN}✅ Supabase CLI is already installed${NC}"
fi

# Check if user is logged into Supabase
echo -e "${BLUE}Checking Supabase authentication...${NC}"
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Please login to Supabase first:${NC}"
    echo "supabase login"
    echo -e "${YELLOW}Then run this script again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Supabase authentication verified${NC}"

# Get Resend API Key
echo ""
echo -e "${BLUE}📧 Resend Setup${NC}"
echo "=============="
echo "1. Go to https://resend.com and sign up"
echo "2. Verify your domain: allianceprocurementandcapacitybuilding.org"
echo "3. Add these DNS records to Namecheap:"
echo ""
echo -e "${YELLOW}TXT Record:${NC}"
echo "Host: @"
echo "Value: v=spf1 include:_spf.resend.com ~all"
echo ""
echo -e "${YELLOW}CNAME Record:${NC}"
echo "Host: resend._domainkey"
echo "Value: resend._domainkey.resend.com"
echo ""
echo -e "${YELLOW}TXT Record:${NC}"
echo "Host: _dmarc"
echo "Value: v=DMARC1; p=quarantine; rua=mailto:charles@allianceprocurementandcapacitybuilding.org"
echo ""

# Prompt for API key
read -p "Enter your Resend API Key (starts with 're_'): " RESEND_API_KEY

if [[ ! $RESEND_API_KEY =~ ^re_.+ ]]; then
    echo -e "${RED}❌ Invalid API key format. Should start with 're_'${NC}"
    exit 1
fi

# Set the secret in Supabase
echo -e "${BLUE}Setting up Supabase secrets...${NC}"
echo "$RESEND_API_KEY" | supabase secrets set RESEND_API_KEY

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ RESEND_API_KEY secret set successfully${NC}"
else
    echo -e "${RED}❌ Failed to set RESEND_API_KEY secret${NC}"
    exit 1
fi

# Deploy the Edge Function
echo -e "${BLUE}Deploying send-email Edge Function...${NC}"
supabase functions deploy send-email

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ send-email function deployed successfully${NC}"
else
    echo -e "${RED}❌ Failed to deploy send-email function${NC}"
    exit 1
fi

# Test the function
echo -e "${BLUE}Testing the email function...${NC}"
TEST_EMAIL=$(cat << EOF
{
  "to": "charles@allianceprocurementandcapacitybuilding.org",
  "subject": "🧪 Test Email from Alliance PCBL",
  "html": "<h1>Hello from Alliance!</h1><p>This is a test email to verify your Resend integration is working correctly.</p><p>✅ If you receive this, your email system is ready!</p>"
}
EOF
)

# Get project reference
PROJECT_REF=$(supabase status | grep "API URL" | awk '{print $3}' | sed 's|https://||' | cut -d'.' -f1)

if [ -z "$PROJECT_REF" ]; then
    echo -e "${YELLOW}⚠️  Could not auto-detect project reference. Please test manually:${NC}"
    echo "supabase functions invoke send-email --data '{\"to\":\"your-email@example.com\",\"subject\":\"Test\",\"html\":\"<h1>Hello!</h1>\"}'"
else
    echo "$TEST_EMAIL" | supabase functions invoke send-email

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Test email sent successfully!${NC}"
        echo "Check your inbox: charles@allianceprocurementandcapacitybuilding.org"
    else
        echo -e "${YELLOW}⚠️  Test may have failed. Check function logs:${NC}"
        echo "supabase functions logs send-email"
    fi
fi

# Create .env file for local development
echo -e "${BLUE}Creating .env file...${NC}"

if [ ! -f .env ]; then
    cat > .env << EOF
# Resend Email Configuration
RESEND_API_KEY=$RESEND_API_KEY

# Supabase Configuration (update with your values)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Email Configuration
FROM_EMAIL=charles@allianceprocurementandcapacitybuilding.org
EOF
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please update the Supabase URL and Anon Key in .env file${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists. Please add:${NC}"
    echo "RESEND_API_KEY=$RESEND_API_KEY"
fi

# Install React dependencies
echo -e "${BLUE}Installing React dependencies...${NC}"
cd client
npm install

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "=================="
echo ""
echo -e "${GREEN}✅ Resend API integrated${NC}"
echo -e "${GREEN}✅ Supabase Edge Function deployed${NC}"
echo -e "${GREEN}✅ Environment configured${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Wait 24-48 hours for DNS propagation"
echo "2. Verify domain in Resend dashboard"
echo "3. Update .env file with your Supabase credentials"
echo "4. Test registration confirmation emails"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "• View function logs: supabase functions logs send-email"
echo "• Test email function: supabase functions invoke send-email --data '{...}'"
echo "• Redeploy function: supabase functions deploy send-email"
echo ""
echo -e "${BLUE}Email Limits (Free Tier):${NC}"
echo "• Resend: 3,000 emails/month, 100 emails/day"
echo "• Perfect for your needs!"
echo ""
echo -e "${YELLOW}📧 Don't forget to:${NC}"
echo "1. Test the registration flow"
echo "2. Check spam folder for test emails"
echo "3. Monitor delivery in Resend dashboard"
echo ""
echo -e "${GREEN}Happy emailing! 🚀${NC}"

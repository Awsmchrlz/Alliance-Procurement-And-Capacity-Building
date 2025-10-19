#!/bin/bash
# Setup Validation Script for APCB Platform

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  APCB Platform - Setup Validation                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

ERRORS=0
WARNINGS=0

# Function to check if command exists
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is not installed"
        ((ERRORS++))
        return 1
    fi
}

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        return 0
    else
        echo -e "${RED}✗${NC} $1 not found"
        ((ERRORS++))
        return 1
    fi
}

# Function to check directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 directory exists"
        return 0
    else
        echo -e "${RED}✗${NC} $1 directory not found"
        ((ERRORS++))
        return 1
    fi
}

# Check prerequisites
echo -e "${YELLOW}Checking Prerequisites...${NC}"
check_command node
check_command npm
check_command docker
check_command git

echo ""

# Check Node version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        echo -e "${GREEN}✓${NC} Node.js version is $NODE_VERSION (>= 18)"
    else
        echo -e "${RED}✗${NC} Node.js version is $NODE_VERSION (< 18 required)"
        ((ERRORS++))
    fi
fi

echo ""

# Check project structure
echo -e "${YELLOW}Checking Project Structure...${NC}"
check_dir "client"
check_dir "server"
check_dir "shared"
check_dir "k8s"
check_file "package.json"
check_file "Dockerfile"
check_file "docker-compose.yml"
check_file ".env.example"

echo ""

# Check environment file
echo -e "${YELLOW}Checking Environment Configuration...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    
    # Check for required variables
    REQUIRED_VARS=("SUPABASE_URL" "SUPABASE_SERVICE_ROLE_KEY" "SUPABASE_ANON_KEY" "RESEND_API_KEY")
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${var}=" .env; then
            VALUE=$(grep "^${var}=" .env | cut -d'=' -f2)
            if [[ "$VALUE" == *"your-"* ]] || [[ "$VALUE" == *"here"* ]]; then
                echo -e "${YELLOW}⚠${NC} $var is set but appears to be a placeholder"
                ((WARNINGS++))
            else
                echo -e "${GREEN}✓${NC} $var is configured"
            fi
        else
            echo -e "${RED}✗${NC} $var is missing"
            ((ERRORS++))
        fi
    done
else
    echo -e "${YELLOW}⚠${NC} .env file not found (copy from .env.example)"
    ((WARNINGS++))
fi

echo ""

# Check Docker setup
echo -e "${YELLOW}Checking Docker Setup...${NC}"
if docker info &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker daemon is running"
else
    echo -e "${RED}✗${NC} Docker daemon is not running"
    ((ERRORS++))
fi

echo ""

# Check Kubernetes files
echo -e "${YELLOW}Checking Kubernetes Configuration...${NC}"
check_file "k8s/apcb-deployment.yaml"
check_file "k8s/kustomization.yaml"
check_file "k8s/deploy.sh"
check_file "k8s/secrets.example.yaml"

if [ -f "k8s/deploy.sh" ]; then
    if [ -x "k8s/deploy.sh" ]; then
        echo -e "${GREEN}✓${NC} k8s/deploy.sh is executable"
    else
        echo -e "${YELLOW}⚠${NC} k8s/deploy.sh is not executable (run: chmod +x k8s/deploy.sh)"
        ((WARNINGS++))
    fi
fi

echo ""

# Check GitHub Actions
echo -e "${YELLOW}Checking CI/CD Configuration...${NC}"
check_file ".github/workflows/docker-build-push.yml"

echo ""

# Check for placeholder values
echo -e "${YELLOW}Checking for Placeholder Values...${NC}"
if grep -r "yourusername" k8s/*.yaml 2>/dev/null | grep -v "example" | grep -v "#" > /dev/null; then
    echo -e "${YELLOW}⚠${NC} Found 'yourusername' placeholder in k8s files"
    ((WARNINGS++))
else
    echo -e "${GREEN}✓${NC} No 'yourusername' placeholders in main k8s files"
fi

if grep -r "apcb.org" k8s/apcb-deployment.yaml 2>/dev/null > /dev/null; then
    echo -e "${YELLOW}⚠${NC} Found 'apcb.org' domain in k8s deployment (update if needed)"
    ((WARNINGS++))
fi

echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Validation Summary                                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Your setup looks good.${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  1. Install dependencies: npm install"
    echo "  2. Start development: npm run dev"
    echo "  3. Or build Docker image: docker build -t apcb-platform ."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Setup is mostly complete with $WARNINGS warning(s)${NC}"
    echo ""
    echo -e "${YELLOW}Please review the warnings above.${NC}"
    exit 0
else
    echo -e "${RED}✗ Found $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo ""
    echo -e "${RED}Please fix the errors above before proceeding.${NC}"
    exit 1
fi

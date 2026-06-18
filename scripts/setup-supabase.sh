#!/bin/bash

# ===========================================================================
# PROPATI — Supabase Project Setup Script
# ===========================================================================
# This script automates the creation of a new Supabase project using the CLI
# and extracts the necessary connection strings for the .env file.
#
# Prerequisites:
# - Supabase account (https://supabase.com)
# - Supabase CLI installed (npx supabase or npm install -g supabase)
# - Access token from: https://supabase.com/dashboard/account/tokens
#
# Usage:
#   ./scripts/setup-supabase.sh
#
# What it does:
# 1. Authenticates with Supabase
# 2. Lists organizations and prompts for org ID
# 3. Creates a new project in the selected organization
# 4. Retrieves database connection strings
# 5. Outputs credentials for manual .env setup or piped to setup-env.sh
# ===========================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="propati-production"
REGION="eu-west-2"  # London region (closest to Nigeria)
DB_PASSWORD=""      # Will be generated or prompted

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}PROPATI — Supabase Project Setup${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

# ===========================================================================
# Step 1: Check Supabase CLI Installation
# ===========================================================================
echo -e "${YELLOW}[1/7] Checking Supabase CLI installation...${NC}"

if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed.${NC}"
    echo -e "${YELLOW}Install it with: npm install -g supabase${NC}"
    echo -e "${YELLOW}Or use: npx supabase <command>${NC}"
    exit 1
fi

SUPABASE_VERSION=$(supabase --version 2>&1 | grep -oP '\d+\.\d+\.\d+' || echo "unknown")
echo -e "${GREEN}✓ Supabase CLI installed (version: ${SUPABASE_VERSION})${NC}"
echo ""

# ===========================================================================
# Step 2: Authenticate with Supabase
# ===========================================================================
echo -e "${YELLOW}[2/7] Authenticating with Supabase...${NC}"
echo -e "${BLUE}You'll need an access token from: https://supabase.com/dashboard/account/tokens${NC}"
echo ""

# Check if already logged in
if supabase projects list &> /dev/null; then
    echo -e "${GREEN}✓ Already authenticated with Supabase${NC}"
else
    echo -e "${YELLOW}Please enter your Supabase access token:${NC}"
    read -s SUPABASE_TOKEN
    echo ""

    if [ -z "$SUPABASE_TOKEN" ]; then
        echo -e "${RED}Error: Access token is required${NC}"
        exit 1
    fi

    # Login using token
    echo "$SUPABASE_TOKEN" | supabase login

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Successfully authenticated${NC}"
    else
        echo -e "${RED}Error: Authentication failed${NC}"
        exit 1
    fi
fi
echo ""

# ===========================================================================
# Step 3: List Organizations and Select One
# ===========================================================================
echo -e "${YELLOW}[3/7] Retrieving organizations...${NC}"

# Get organization list
ORG_LIST=$(supabase orgs list 2>&1)

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to retrieve organizations${NC}"
    echo "$ORG_LIST"
    exit 1
fi

echo "$ORG_LIST"
echo ""

echo -e "${YELLOW}Enter your Organization ID (from the list above):${NC}"
read ORG_ID

if [ -z "$ORG_ID" ]; then
    echo -e "${RED}Error: Organization ID is required${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Using organization: ${ORG_ID}${NC}"
echo ""

# ===========================================================================
# Step 4: Prompt for Project Name and Region
# ===========================================================================
echo -e "${YELLOW}[4/7] Configuring project details...${NC}"

echo -e "${BLUE}Project name (default: ${PROJECT_NAME}):${NC}"
read -r USER_PROJECT_NAME
if [ -n "$USER_PROJECT_NAME" ]; then
    PROJECT_NAME="$USER_PROJECT_NAME"
fi

echo -e "${BLUE}Region (default: ${REGION} - closest to Nigeria):${NC}"
echo -e "${BLUE}Available regions: eu-west-1, eu-west-2, us-east-1, ap-southeast-1, etc.${NC}"
read -r USER_REGION
if [ -n "$USER_REGION" ]; then
    REGION="$USER_REGION"
fi

# Generate or prompt for database password
echo -e "${BLUE}Database password (leave empty to auto-generate):${NC}"
read -s USER_DB_PASSWORD
echo ""

if [ -z "$USER_DB_PASSWORD" ]; then
    # Generate a secure password (alphanumeric, 32 chars)
    DB_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
    echo -e "${GREEN}✓ Generated secure database password${NC}"
else
    DB_PASSWORD="$USER_DB_PASSWORD"
    echo -e "${GREEN}✓ Using provided database password${NC}"
fi

echo ""
echo -e "${BLUE}Summary:${NC}"
echo -e "  Project Name: ${PROJECT_NAME}"
echo -e "  Region: ${REGION}"
echo -e "  Organization ID: ${ORG_ID}"
echo -e "  Database Password: [hidden]"
echo ""

echo -e "${YELLOW}Proceed with project creation? (y/n)${NC}"
read -r CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo -e "${RED}Setup cancelled${NC}"
    exit 0
fi

echo ""

# ===========================================================================
# Step 5: Create Supabase Project
# ===========================================================================
echo -e "${YELLOW}[5/7] Creating Supabase project...${NC}"
echo -e "${BLUE}This may take 2-3 minutes...${NC}"
echo ""

# Create project
CREATE_OUTPUT=$(supabase projects create "$PROJECT_NAME" \
    --org-id "$ORG_ID" \
    --region "$REGION" \
    --db-password "$DB_PASSWORD" \
    2>&1)

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to create project${NC}"
    echo "$CREATE_OUTPUT"
    exit 1
fi

echo "$CREATE_OUTPUT"
echo ""

# Extract project reference from output (format: "Created project <ref> in organization <org>")
PROJECT_REF=$(echo "$CREATE_OUTPUT" | grep -oP 'Created project \K[a-zA-Z0-9]+' || echo "")

if [ -z "$PROJECT_REF" ]; then
    echo -e "${YELLOW}Warning: Could not extract project reference automatically${NC}"
    echo -e "${YELLOW}Please enter the project reference (shown above):${NC}"
    read PROJECT_REF
fi

echo -e "${GREEN}✓ Project created successfully!${NC}"
echo -e "${GREEN}  Project Reference: ${PROJECT_REF}${NC}"
echo ""

# ===========================================================================
# Step 6: Retrieve Connection Strings
# ===========================================================================
echo -e "${YELLOW}[6/7] Retrieving connection strings...${NC}"

# Get project details using API or CLI
PROJECT_URL="https://${PROJECT_REF}.supabase.co"

# The API keys need to be retrieved from the project settings
echo -e "${BLUE}Fetching API keys...${NC}"

# Use Supabase CLI to get project details
API_KEYS=$(supabase projects api-keys --project-ref "$PROJECT_REF" 2>&1)

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Warning: Could not automatically retrieve API keys${NC}"
    echo "$API_KEYS"
    echo ""
    echo -e "${YELLOW}Please retrieve your keys manually from:${NC}"
    echo -e "${BLUE}https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api${NC}"
    ANON_KEY="<retrieve_from_dashboard>"
    SERVICE_ROLE_KEY="<retrieve_from_dashboard>"
else
    # Parse the API keys output
    ANON_KEY=$(echo "$API_KEYS" | grep -oP 'anon.*?:\s*\K[a-zA-Z0-9._-]+' || echo "<retrieve_from_dashboard>")
    SERVICE_ROLE_KEY=$(echo "$API_KEYS" | grep -oP 'service_role.*?:\s*\K[a-zA-Z0-9._-]+' || echo "<retrieve_from_dashboard>")
fi

# Construct connection strings
# Transaction pooler (pgbouncer) - recommended for serverless/runtime queries
DATABASE_URL="postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-${REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct connection - for migrations and admin tasks
DIRECT_URL="postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"

echo -e "${GREEN}✓ Connection strings generated${NC}"
echo ""

# ===========================================================================
# Step 7: Output Credentials
# ===========================================================================
echo -e "${YELLOW}[7/7] Setup complete!${NC}"
echo ""
echo -e "${GREEN}============================================================================${NC}"
echo -e "${GREEN}PROPATI — Supabase Credentials${NC}"
echo -e "${GREEN}============================================================================${NC}"
echo ""
echo -e "${BLUE}Project Details:${NC}"
echo -e "  Project Name: ${PROJECT_NAME}"
echo -e "  Project Reference: ${PROJECT_REF}"
echo -e "  Project URL: ${PROJECT_URL}"
echo -e "  Region: ${REGION}"
echo ""
echo -e "${BLUE}Database Credentials:${NC}"
echo ""
echo -e "${YELLOW}# Database Connection (for runtime - uses pgbouncer)${NC}"
echo "DATABASE_URL=\"${DATABASE_URL}\""
echo ""
echo -e "${YELLOW}# Direct Database Connection (for migrations)${NC}"
echo "DIRECT_URL=\"${DIRECT_URL}\""
echo ""
echo -e "${YELLOW}# Supabase API${NC}"
echo "NEXT_PUBLIC_SUPABASE_URL=\"${PROJECT_URL}\""
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=\"${ANON_KEY}\""
echo "SUPABASE_SERVICE_ROLE_KEY=\"${SERVICE_ROLE_KEY}\""
echo ""
echo -e "${GREEN}============================================================================${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Save these credentials securely"
echo -e "  2. Run: ${YELLOW}./scripts/setup-env.sh${NC} to populate your .env file"
echo -e "  3. Run: ${YELLOW}./scripts/run-migrations.sh${NC} to set up the database schema"
echo ""
echo -e "${BLUE}Dashboard URL:${NC}"
echo -e "  ${PROJECT_URL}/project/${PROJECT_REF}"
echo ""
echo -e "${YELLOW}IMPORTANT: Keep your database password and service role key secure!${NC}"
echo ""

# Export credentials to a temporary file for setup-env.sh to read
cat > /tmp/propati-supabase-credentials.env <<EOF
PROJECT_NAME=${PROJECT_NAME}
PROJECT_REF=${PROJECT_REF}
PROJECT_URL=${PROJECT_URL}
DATABASE_URL=${DATABASE_URL}
DIRECT_URL=${DIRECT_URL}
NEXT_PUBLIC_SUPABASE_URL=${PROJECT_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}
EOF

echo -e "${GREEN}✓ Credentials saved to /tmp/propati-supabase-credentials.env${NC}"
echo -e "${GREEN}✓ Run ./scripts/setup-env.sh to automatically populate your .env file${NC}"
echo ""

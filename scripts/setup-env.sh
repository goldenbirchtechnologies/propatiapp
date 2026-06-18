#!/bin/bash

# ===========================================================================
# PROPATI — Environment File Setup Script
# ===========================================================================
# This script populates the .env file with database credentials from Supabase
# and preserves existing environment variables.
#
# Prerequisites:
# - Run setup-supabase.sh first (creates /tmp/propati-supabase-credentials.env)
# - Or have credentials ready to input manually
#
# Usage:
#   ./scripts/setup-env.sh
#
# What it does:
# 1. Checks if .env exists, backs it up if it does
# 2. Reads credentials from /tmp/propati-supabase-credentials.env or prompts
# 3. Updates or creates .env file with database credentials
# 4. Preserves existing non-database environment variables
# ===========================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
PROJECT_ROOT="/c/Users/USER/Documents/NEWPROPATI"
ENV_FILE="${PROJECT_ROOT}/.env"
ENV_EXAMPLE="${PROJECT_ROOT}/.env.example"
CREDENTIALS_FILE="/tmp/propati-supabase-credentials.env"

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}PROPATI — Environment File Setup${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

# ===========================================================================
# Step 1: Check for Existing .env File
# ===========================================================================
echo -e "${YELLOW}[1/4] Checking for existing .env file...${NC}"

if [ -f "$ENV_FILE" ]; then
    BACKUP_FILE="${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${YELLOW}Found existing .env file${NC}"
    echo -e "${YELLOW}Creating backup: ${BACKUP_FILE}${NC}"
    cp "$ENV_FILE" "$BACKUP_FILE"
    echo -e "${GREEN}✓ Backup created${NC}"
else
    echo -e "${BLUE}No existing .env file found${NC}"
    if [ -f "$ENV_EXAMPLE" ]; then
        echo -e "${BLUE}Copying from .env.example...${NC}"
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        echo -e "${GREEN}✓ Created .env from template${NC}"
    else
        echo -e "${YELLOW}Creating new .env file...${NC}"
        touch "$ENV_FILE"
        echo -e "${GREEN}✓ Created empty .env file${NC}"
    fi
fi
echo ""

# ===========================================================================
# Step 2: Read Supabase Credentials
# ===========================================================================
echo -e "${YELLOW}[2/4] Reading Supabase credentials...${NC}"

# Try to read from credentials file first
if [ -f "$CREDENTIALS_FILE" ]; then
    echo -e "${BLUE}Found credentials from setup-supabase.sh${NC}"
    source "$CREDENTIALS_FILE"
    echo -e "${GREEN}✓ Credentials loaded from ${CREDENTIALS_FILE}${NC}"
else
    echo -e "${YELLOW}No credentials file found. Please enter credentials manually.${NC}"
    echo ""

    echo -e "${BLUE}Enter DATABASE_URL (with pgbouncer):${NC}"
    read -r DATABASE_URL

    echo -e "${BLUE}Enter DIRECT_URL (optional, press Enter to skip):${NC}"
    read -r DIRECT_URL

    echo -e "${BLUE}Enter NEXT_PUBLIC_SUPABASE_URL:${NC}"
    read -r NEXT_PUBLIC_SUPABASE_URL

    echo -e "${BLUE}Enter NEXT_PUBLIC_SUPABASE_ANON_KEY:${NC}"
    read -r NEXT_PUBLIC_SUPABASE_ANON_KEY

    echo -e "${BLUE}Enter SUPABASE_SERVICE_ROLE_KEY:${NC}"
    read -s SUPABASE_SERVICE_ROLE_KEY
    echo ""

    if [ -z "$DATABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        echo -e "${RED}Error: Required credentials are missing${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ Manual credentials provided${NC}"
fi
echo ""

# ===========================================================================
# Step 3: Update .env File
# ===========================================================================
echo -e "${YELLOW}[3/4] Updating .env file...${NC}"

# Function to update or add environment variable
update_env_var() {
    local key="$1"
    local value="$2"
    local file="$3"

    if [ -z "$value" ]; then
        return
    fi

    # Escape special characters in value for sed
    local escaped_value=$(echo "$value" | sed 's/[&/\]/\\&/g')

    # Check if key exists in file
    if grep -q "^${key}=" "$file" 2>/dev/null; then
        # Update existing key
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|^${key}=.*|${key}=\"${escaped_value}\"|" "$file"
        else
            # Linux/Git Bash
            sed -i "s|^${key}=.*|${key}=\"${escaped_value}\"|" "$file"
        fi
        echo -e "  ${GREEN}✓${NC} Updated: ${key}"
    else
        # Add new key
        echo "${key}=\"${value}\"" >> "$file"
        echo -e "  ${GREEN}+${NC} Added: ${key}"
    fi
}

# Update database credentials
echo -e "${BLUE}Updating database credentials...${NC}"
update_env_var "DATABASE_URL" "$DATABASE_URL" "$ENV_FILE"

if [ -n "$DIRECT_URL" ]; then
    update_env_var "DIRECT_URL" "$DIRECT_URL" "$ENV_FILE"
fi

# Update Supabase credentials
echo -e "${BLUE}Updating Supabase API credentials...${NC}"
update_env_var "NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL" "$ENV_FILE"
update_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_ANON_KEY" "$ENV_FILE"

if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    update_env_var "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY" "$ENV_FILE"
fi

echo -e "${GREEN}✓ Environment file updated${NC}"
echo ""

# ===========================================================================
# Step 4: Validate .env File
# ===========================================================================
echo -e "${YELLOW}[4/4] Validating .env file...${NC}"

# Check for required variables
MISSING_VARS=()

check_var() {
    local var_name="$1"
    if ! grep -q "^${var_name}=" "$ENV_FILE"; then
        MISSING_VARS+=("$var_name")
    fi
}

# Check critical variables
check_var "DATABASE_URL"
check_var "NEXT_PUBLIC_SUPABASE_URL"
check_var "NEXT_PUBLIC_SUPABASE_ANON_KEY"

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${YELLOW}Warning: The following required variables are missing:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo -e "  ${RED}✗${NC} $var"
    done
    echo ""
    echo -e "${YELLOW}Please add them manually to ${ENV_FILE}${NC}"
else
    echo -e "${GREEN}✓ All required database variables are present${NC}"
fi

# Check for placeholder values
if grep -q "<retrieve_from_dashboard>" "$ENV_FILE" 2>/dev/null; then
    echo ""
    echo -e "${YELLOW}Warning: Some values contain placeholders${NC}"
    echo -e "${YELLOW}Please update these manually:${NC}"
    grep "<retrieve_from_dashboard>" "$ENV_FILE" | sed 's/^/  /'
fi

echo ""
echo -e "${GREEN}============================================================================${NC}"
echo -e "${GREEN}Environment File Setup Complete!${NC}"
echo -e "${GREEN}============================================================================${NC}"
echo ""
echo -e "${BLUE}Configuration Summary:${NC}"
echo -e "  Location: ${ENV_FILE}"
echo -e "  Database: ${GREEN}✓${NC} Configured"
echo -e "  Supabase: ${GREEN}✓${NC} Configured"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Review your .env file: ${YELLOW}cat ${ENV_FILE}${NC}"
echo -e "  2. Add remaining credentials (Clerk, Paystack, etc.)"
echo -e "  3. Run migrations: ${YELLOW}./scripts/run-migrations.sh${NC}"
echo ""
echo -e "${YELLOW}SECURITY REMINDER:${NC}"
echo -e "  - Never commit .env to version control"
echo -e "  - .env is already in .gitignore"
echo -e "  - Keep your credentials secure"
echo ""

# Clean up credentials file
if [ -f "$CREDENTIALS_FILE" ]; then
    echo -e "${BLUE}Cleaning up temporary credentials file...${NC}"
    rm "$CREDENTIALS_FILE"
    echo -e "${GREEN}✓ Temporary file removed${NC}"
    echo ""
fi

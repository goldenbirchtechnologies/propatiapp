#!/bin/bash

# ===========================================================================
# PROPATI — Database Migration Script
# ===========================================================================
# This script runs Prisma migrations against the Supabase database.
#
# Prerequisites:
# - .env file with DATABASE_URL and DIRECT_URL configured
# - Prisma schema at prisma/schema.prisma
# - Node.js and npm installed
# - @prisma/client and prisma packages installed
#
# Usage:
#   ./scripts/run-migrations.sh [options]
#
# Options:
#   --dev         Run development migration (creates migration files)
#   --deploy      Run production migration (applies existing migrations)
#   --reset       Reset database (WARNING: deletes all data)
#   --status      Check migration status
#
# What it does:
# 1. Validates environment and prerequisites
# 2. Checks database connectivity
# 3. Runs Prisma migrations
# 4. Generates Prisma Client
# 5. Verifies schema deployment
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
SCHEMA_FILE="${PROJECT_ROOT}/prisma/schema.prisma"

# Default mode
MODE="dev"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dev)
            MODE="dev"
            shift
            ;;
        --deploy)
            MODE="deploy"
            shift
            ;;
        --reset)
            MODE="reset"
            shift
            ;;
        --status)
            MODE="status"
            shift
            ;;
        *)
            echo -e "${RED}Error: Unknown option $1${NC}"
            echo "Usage: $0 [--dev|--deploy|--reset|--status]"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}PROPATI — Database Migration${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

# ===========================================================================
# Step 1: Validate Prerequisites
# ===========================================================================
echo -e "${YELLOW}[1/6] Validating prerequisites...${NC}"

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: .env file not found at ${ENV_FILE}${NC}"
    echo -e "${YELLOW}Run ./scripts/setup-env.sh first${NC}"
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "^DATABASE_URL=" "$ENV_FILE"; then
    echo -e "${RED}Error: DATABASE_URL not found in .env${NC}"
    echo -e "${YELLOW}Run ./scripts/setup-env.sh to configure database${NC}"
    exit 1
fi

# Check if Prisma schema exists
if [ ! -f "$SCHEMA_FILE" ]; then
    echo -e "${RED}Error: Prisma schema not found at ${SCHEMA_FILE}${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

# Check if npm/npx is installed
if ! command -v npx &> /dev/null; then
    echo -e "${RED}Error: npx is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version)${NC}"
echo -e "${GREEN}✓ npm $(npm --version)${NC}"
echo -e "${GREEN}✓ .env file found${NC}"
echo -e "${GREEN}✓ Prisma schema found${NC}"
echo ""

# ===========================================================================
# Step 2: Load Environment Variables
# ===========================================================================
echo -e "${YELLOW}[2/6] Loading environment variables...${NC}"

# Source .env file (be careful with this in production)
set -a
source "$ENV_FILE"
set +a

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL is empty${NC}"
    exit 1
fi

# For migrations, prefer DIRECT_URL over DATABASE_URL (avoid pgbouncer)
if [ -n "$DIRECT_URL" ]; then
    export DATABASE_URL="$DIRECT_URL"
    echo -e "${GREEN}✓ Using DIRECT_URL for migrations${NC}"
    echo -e "${BLUE}  (Direct connection bypasses pgbouncer for DDL operations)${NC}"
else
    echo -e "${YELLOW}Warning: DIRECT_URL not set, using DATABASE_URL${NC}"
    echo -e "${YELLOW}If migrations fail, add DIRECT_URL to .env${NC}"
fi

echo -e "${GREEN}✓ Environment variables loaded${NC}"
echo ""

# ===========================================================================
# Step 3: Verify Database Connectivity
# ===========================================================================
echo -e "${YELLOW}[3/6] Testing database connection...${NC}"

# Use Prisma db execute to test connectivity
CONNECTION_TEST=$(npx prisma db execute --stdin <<< "SELECT 1;" 2>&1 || echo "FAILED")

if echo "$CONNECTION_TEST" | grep -q "FAILED\|Error\|error"; then
    echo -e "${RED}Error: Cannot connect to database${NC}"
    echo "$CONNECTION_TEST"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo -e "  1. Verify DATABASE_URL in .env is correct"
    echo -e "  2. Check if database is accessible from your network"
    echo -e "  3. Verify database credentials"
    echo -e "  4. Check Supabase project status in dashboard"
    exit 1
fi

echo -e "${GREEN}✓ Database connection successful${NC}"
echo ""

# ===========================================================================
# Step 4: Check Migration Status
# ===========================================================================
if [ "$MODE" != "status" ]; then
    echo -e "${YELLOW}[4/6] Checking migration status...${NC}"
fi

MIGRATION_STATUS=$(npx prisma migrate status 2>&1 || true)
echo "$MIGRATION_STATUS"
echo ""

if [ "$MODE" = "status" ]; then
    echo -e "${GREEN}Migration status check complete${NC}"
    exit 0
fi

# ===========================================================================
# Step 5: Run Migrations
# ===========================================================================
echo -e "${YELLOW}[5/6] Running migrations (mode: ${MODE})...${NC}"

case $MODE in
    dev)
        echo -e "${BLUE}Running development migration...${NC}"
        echo -e "${BLUE}This will:${NC}"
        echo -e "  - Create a new migration if schema changed"
        echo -e "  - Apply all pending migrations"
        echo -e "  - Generate Prisma Client"
        echo ""

        # Prompt for migration name
        echo -e "${YELLOW}Enter migration name (e.g., 'init', 'add_listings_table'):${NC}"
        read -r MIGRATION_NAME

        if [ -z "$MIGRATION_NAME" ]; then
            MIGRATION_NAME="migration_$(date +%Y%m%d_%H%M%S)"
            echo -e "${YELLOW}Using default name: ${MIGRATION_NAME}${NC}"
        fi

        echo ""
        npx prisma migrate dev --name "$MIGRATION_NAME"

        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✓ Development migration complete${NC}"
        else
            echo ""
            echo -e "${RED}Error: Migration failed${NC}"
            exit 1
        fi
        ;;

    deploy)
        echo -e "${BLUE}Running production deployment...${NC}"
        echo -e "${BLUE}This will:${NC}"
        echo -e "  - Apply all pending migrations"
        echo -e "  - NOT create new migration files"
        echo ""

        echo -e "${YELLOW}Proceed with production deployment? (y/n)${NC}"
        read -r CONFIRM

        if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
            echo -e "${RED}Deployment cancelled${NC}"
            exit 0
        fi

        echo ""
        npx prisma migrate deploy

        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✓ Production deployment complete${NC}"
        else
            echo ""
            echo -e "${RED}Error: Deployment failed${NC}"
            exit 1
        fi
        ;;

    reset)
        echo -e "${RED}WARNING: This will DELETE ALL DATA in the database!${NC}"
        echo -e "${RED}This operation cannot be undone!${NC}"
        echo ""
        echo -e "${YELLOW}Type 'DELETE ALL DATA' to confirm:${NC}"
        read -r CONFIRM

        if [ "$CONFIRM" != "DELETE ALL DATA" ]; then
            echo -e "${RED}Reset cancelled${NC}"
            exit 0
        fi

        echo ""
        echo -e "${BLUE}Resetting database...${NC}"
        npx prisma migrate reset --force

        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✓ Database reset complete${NC}"
        else
            echo ""
            echo -e "${RED}Error: Reset failed${NC}"
            exit 1
        fi
        ;;
esac

echo ""

# ===========================================================================
# Step 6: Generate Prisma Client
# ===========================================================================
echo -e "${YELLOW}[6/6] Generating Prisma Client...${NC}"

npx prisma generate

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Prisma Client generated${NC}"
else
    echo ""
    echo -e "${YELLOW}Warning: Prisma Client generation had issues${NC}"
fi

echo ""

# ===========================================================================
# Summary
# ===========================================================================
echo -e "${GREEN}============================================================================${NC}"
echo -e "${GREEN}Migration Complete!${NC}"
echo -e "${GREEN}============================================================================${NC}"
echo ""

# Count tables in schema
TABLE_COUNT=$(grep -c "^model " "$SCHEMA_FILE" || echo "0")

echo -e "${BLUE}Database Schema Summary:${NC}"
echo -e "  Total Models: ${TABLE_COUNT}"
echo -e "  Schema File: ${SCHEMA_FILE}"
echo ""

echo -e "${BLUE}What was done:${NC}"
case $MODE in
    dev)
        echo -e "  ${GREEN}✓${NC} Created/applied migration: ${MIGRATION_NAME}"
        echo -e "  ${GREEN}✓${NC} Database schema updated"
        echo -e "  ${GREEN}✓${NC} Prisma Client generated"
        ;;
    deploy)
        echo -e "  ${GREEN}✓${NC} Applied all pending migrations"
        echo -e "  ${GREEN}✓${NC} Prisma Client generated"
        ;;
    reset)
        echo -e "  ${GREEN}✓${NC} Database reset and recreated"
        echo -e "  ${GREEN}✓${NC} All migrations reapplied"
        echo -e "  ${GREEN}✓${NC} Prisma Client generated"
        ;;
esac

echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Verify schema: ${YELLOW}npx prisma studio${NC}"
echo -e "  2. Check tables: ${YELLOW}npx prisma db pull${NC}"
echo -e "  3. Seed database: ${YELLOW}npm run seed${NC} (if seed script exists)"
echo ""
echo -e "${BLUE}Migration History:${NC}"
echo -e "  Check status: ${YELLOW}./scripts/run-migrations.sh --status${NC}"
echo ""
echo -e "${YELLOW}REMINDER:${NC}"
echo -e "  - Migration files are in: prisma/migrations/"
echo -e "  - Commit migration files to version control"
echo -e "  - Use --deploy for production deployments"
echo ""

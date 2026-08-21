-- Migration: remove agent invite-only gate
-- Agents can now register directly without admin approval

-- 1) Set default for agent_approved to true
ALTER TABLE users ALTER COLUMN agent_approved SET DEFAULT true;

-- 2) Backfill any existing unapproved agents so they aren't stuck behind the old gate
UPDATE users SET agent_approved = true WHERE role = 'agent' AND agent_approved = false;

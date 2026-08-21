-- Migration: add optional agent invites
-- Agents can still register directly; invite is optional workflow

-- 1) Enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AgentInviteStatus') THEN
    CREATE TYPE "AgentInviteStatus" AS ENUM ('pending', 'accepted', 'revoked');
  END IF;
END
$$;

-- 2) Table
CREATE TABLE IF NOT EXISTS agent_invites (
  id TEXT PRIMARY KEY,
  landlord_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status "AgentInviteStatus" NOT NULL DEFAULT 'pending',
  accepted_at TIMESTAMP,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_invites_landlord ON agent_invites(landlord_id);
CREATE INDEX IF NOT EXISTS idx_agent_invites_agent ON agent_invites(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_invites_email ON agent_invites(email);
CREATE INDEX IF NOT EXISTS idx_agent_invites_status ON agent_invites(status);

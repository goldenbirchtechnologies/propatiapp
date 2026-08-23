import { prisma } from './prisma';

export interface RuleCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: unknown;
}

export interface RuleAction {
  type: string;
  params?: Record<string, unknown>;
}

export interface JurisdictionRule {
  id: string;
  jurisdictionId?: string;
  countryId: string;
  ruleType: string;
  name: string;
  description?: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  effectiveDate?: Date;
  expiryDate?: Date;
  active: boolean;
}

export interface ComplianceEvent {
  id: string;
  legalMatterId: string;
  eventType: string;
  title: string;
  description?: string;
  deadline: Date;
  status: string;
  assignedTo?: string;
  completedAt?: Date;
  completedBy?: string;
  metadata?: Record<string, unknown>;
}

export async function evaluateRules(
  jurisdictionId: string | undefined,
  countryId: string,
  matterType: string,
  context: Record<string, unknown>
): Promise<RuleAction[]> {
  const now = new Date();

  const rules = await prisma.jurisdictionRule.findMany({
    where: {
      OR: [
        { jurisdictionId },
        { countryId, jurisdictionId: null },
      ],
      ruleType: matterType,
      active: true,
      AND: [
        { OR: [{ effectiveDate: null }, { effectiveDate: { lte: now } }] },
        { OR: [{ expiryDate: null }, { expiryDate: { gte: now } }] },
      ],
    },
    orderBy: { priority: 'desc' },
  });

  const actions: RuleAction[] = [];

  for (const rule of rules) {
    const conditions = rule.conditions as unknown as RuleCondition[];
    if (evaluateConditions(conditions, context)) {
      const ruleActions = rule.actions as unknown as RuleAction[];
      actions.push(...ruleActions);
    }
  }

  return actions;
}

function evaluateConditions(conditions: RuleCondition[], context: Record<string, unknown>): boolean {
  return conditions.every(cond => {
    const value = context[cond.field];
    switch (cond.operator) {
      case 'eq': return value === cond.value;
      case 'neq': return value !== cond.value;
      case 'gt': return Number(value) > Number(cond.value);
      case 'gte': return Number(value) >= Number(cond.value);
      case 'lt': return Number(value) < Number(cond.value);
      case 'lte': return Number(value) <= Number(cond.value);
      case 'in': return Array.isArray(cond.value) && cond.value.includes(value);
      case 'contains': return String(value).includes(String(cond.value));
      default: return false;
    }
  });
}

export async function createComplianceEvent(data: {
  legalMatterId: string;
  eventType: string;
  title: string;
  description?: string;
  deadline: Date;
  assignedTo?: string;
  metadata?: Record<string, unknown>;
}): Promise<ComplianceEvent> {
  const event = await prisma.complianceEvent.create({
    data: {
      legalMatterId: data.legalMatterId,
      eventType: data.eventType,
      title: data.title,
      description: data.description,
      deadline: data.deadline,
      assignedTo: data.assignedTo,
      metadata: data.metadata || {},
    },
  });
  return event as unknown as ComplianceEvent;
}

export async function getComplianceEvents(legalMatterId: string): Promise<ComplianceEvent[]> {
  const events = await prisma.complianceEvent.findMany({
    where: { legalMatterId },
    orderBy: { deadline: 'asc' },
  });
  return events as unknown as ComplianceEvent[];
}

export async function completeComplianceEvent(eventId: string, userId: string): Promise<void> {
  await prisma.complianceEvent.update({
    where: { id: eventId },
    data: { status: 'completed', completedAt: new Date(), completedBy: userId },
  });
}

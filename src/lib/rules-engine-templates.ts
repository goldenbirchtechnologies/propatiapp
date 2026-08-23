import { prisma } from './prisma';

export interface DocumentTemplate {
  id: string;
  countryId: string;
  jurisdictionId?: string;
  propertyType?: string;
  tenancyType?: string;
  name: string;
  version: number;
  templateSchema: Record<string, unknown>;
  mandatoryClauses?: string[];
  content: string;
  language: string;
  active: boolean;
  effectiveDate?: Date;
  expiryDate?: Date;
}

export async function getTemplates(countryId: string, options?: {
  jurisdictionId?: string;
  propertyType?: string;
  tenancyType?: string;
}): Promise<DocumentTemplate[]> {
  const templates = await prisma.documentTemplate.findMany({
    where: {
      countryId,
      jurisdictionId: options?.jurisdictionId,
      propertyType: options?.propertyType,
      tenancyType: options?.tenancyType,
      active: true,
    },
    orderBy: [{ name: 'asc' }, { version: 'desc' }],
  });
  return templates as unknown as DocumentTemplate[];
}

export async function getTemplateById(id: string): Promise<DocumentTemplate | null> {
  const template = await prisma.documentTemplate.findUnique({ where: { id } });
  return template as unknown as DocumentTemplate | null;
}

export async function createTemplate(data: {
  countryId: string;
  jurisdictionId?: string;
  propertyType?: string;
  tenancyType?: string;
  name: string;
  templateSchema: Record<string, unknown>;
  mandatoryClauses?: string[];
  content: string;
  language?: string;
}): Promise<DocumentTemplate> {
  const template = await prisma.documentTemplate.create({
    data: {
      countryId: data.countryId,
      jurisdictionId: data.jurisdictionId,
      propertyType: data.propertyType,
      tenancyType: data.tenancyType,
      name: data.name,
      templateSchema: data.templateSchema,
      mandatoryClauses: data.mandatoryClauses || [],
      content: data.content,
      language: data.language || 'en',
    },
  });
  return template as unknown as DocumentTemplate;
}

export async function updateTemplate(id: string, data: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
  const template = await prisma.documentTemplate.update({
    where: { id },
    data: data as any,
  });
  return template as unknown as DocumentTemplate;
}

export async function deleteTemplate(id: string): Promise<void> {
  await prisma.documentTemplate.update({
    where: { id },
    data: { active: false },
  });
}

export async function renderTemplate(
  templateId: string,
  context: Record<string, unknown>
): Promise<string> {
  const template = await getTemplateById(templateId);
  if (!template) throw new Error('Template not found');

  let content = template.content;
  for (const [key, value] of Object.entries(context)) {
    const regex = new RegExp(, 'g');
    content = content.replace(regex, String(value ?? ''));
  }

  return content;
}

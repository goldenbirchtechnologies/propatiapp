// Re-export all types from the generated Prisma client.
export * from '../../node_modules/.prisma/client/index.d.ts';

// Inline type alias for Decimal to make it available at the top-level
// of this module (so `import("@prisma/client").Decimal` resolves).
// We reference it via the Prisma namespace that the generated client declares.
export type Decimal = import('../../node_modules/.prisma/client/index.d.ts').Prisma.Decimal;

export const bogusPathTest = 1;

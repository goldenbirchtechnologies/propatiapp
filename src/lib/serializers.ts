/**
 * Prisma returns BigInt for money columns (yearlyIncome, monthlyBudget) and
 * JSON.stringify throws on BigInt. Always convert at the response boundary —
 * to a string, so money never passes through a float.
 */
export function toMoneyString(value: bigint | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return value.toString();
}

/** Recursively converts every BigInt in a payload to a string. */
export function serializeBigInt<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, val) => (typeof val === 'bigint' ? val.toString() : val))
  ) as T;
}

export function logDashboardDiagnostics(label: string, error: unknown) {
  if (typeof window === "undefined") return;
  try {
    const payload = {
      label,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      digest: error && typeof error === "object" && "digest" in error ? (error as any).digest : undefined,
      cause: error && typeof error === "object" && "cause" in error ? (error as any).cause : undefined,
      ts: new Date().toISOString(),
    };
    console.groupCollapsed(`[dashboard-diagnostics] ${label}`);
    console.table(payload);
    console.groupEnd();
  } catch {
    console.warn("[dashboard-diagnostics] failed to serialize error", error);
  }
}

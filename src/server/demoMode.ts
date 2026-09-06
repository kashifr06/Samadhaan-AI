import { normalizeUserRole } from '../types';

type DemoEnv = Partial<Record<'VITE_DEMO_MODE' | 'DEMO_MODE', string | undefined>>;

export function isDemoModeEnabled(env: DemoEnv = process.env): boolean {
  return env.VITE_DEMO_MODE === 'true' || env.DEMO_MODE === 'true';
}

export function parseDemoRoleRequest(body: unknown) {
  if (!body || typeof body !== 'object') return null;
  const role = normalizeUserRole((body as { role?: unknown }).role);
  if (!role) return null;
  return {
    role,
    entityId: typeof (body as { entityId?: unknown }).entityId === 'string'
      ? (body as { entityId: string }).entityId
      : null,
  };
}

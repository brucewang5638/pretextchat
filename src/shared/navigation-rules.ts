import type { Application } from './types';

export type NavigationDecision = 'allow' | 'external' | 'deny';
export type WindowOpenDecision = 'allow' | 'popup' | 'external' | 'deny';

export function normalizeForMatch(rawUrl: string): { hostname: string; normalized: string } | null {
  try {
    const url = new URL(rawUrl);
    return {
      hostname: url.hostname.toLowerCase(),
      normalized: `${url.protocol}//${url.hostname}${url.pathname}`.replace(/\/+$/, ''),
    };
  } catch {
    return null;
  }
}

export function matchesHost(hostname: string, pattern: string): boolean {
  const p = pattern.toLowerCase();
  if (p.startsWith('*.')) {
    const suffix = p.slice(1);
    return hostname.endsWith(suffix) || hostname === p.slice(2);
  }
  return hostname === p;
}

export function matchesAnyHost(hostname: string, patterns: string[]): boolean {
  return patterns.some((p) => matchesHost(hostname, p));
}

export function evaluateNavigation(app: Application, url: string): NavigationDecision {
  const parsed = normalizeForMatch(url);
  if (!parsed) return 'deny';

  if (
    matchesAnyHost(parsed.hostname, app.navigation.allowedHosts) ||
    matchesAnyHost(parsed.hostname, app.navigation.allowedPopupHosts)
  ) {
    return 'allow';
  }

  if (matchesAnyHost(parsed.hostname, app.navigation.externalHostnames)) {
    return 'external';
  }

  if (app.navigation.externalUrlPrefixes.some((prefix) => parsed.normalized.startsWith(prefix))) {
    return 'external';
  }

  return 'deny';
}

export function evaluateWindowOpen(app: Application, url: string): WindowOpenDecision {
  const parsed = normalizeForMatch(url);
  if (!parsed) return 'deny';

  if (matchesAnyHost(parsed.hostname, app.navigation.allowedPopupHosts)) {
    return 'popup';
  }

  if (matchesAnyHost(parsed.hostname, app.navigation.allowedHosts)) {
    return 'allow';
  }

  if (
    matchesAnyHost(parsed.hostname, app.navigation.externalHostnames) ||
    app.navigation.externalUrlPrefixes.some((prefix) => parsed.normalized.startsWith(prefix))
  ) {
    return 'external';
  }

  return 'deny';
}

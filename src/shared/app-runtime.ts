import type { Application } from './types';

export const GOOGLE_AUTH_SESSION_GROUP = 'google';
export const GOOGLE_WEBVIEW_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36';

export function getAppPartition(app: Application): string {
  if (app.authSessionGroup) {
    return `persist:auth-${app.authSessionGroup}`;
  }

  return `persist:${app.id}`;
}

export function getAppRenderMode(app: Application | null | undefined): 'nativeView' | 'webview' {
  return app?.renderMode ?? 'nativeView';
}

export function isRendererManagedApp(app: Application | null | undefined): boolean {
  return getAppRenderMode(app) === 'webview';
}

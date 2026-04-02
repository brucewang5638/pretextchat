export function resolveAssetPath(assetPath: string): string {
  if (/^(https?:|data:|file:)/i.test(assetPath)) {
    return assetPath;
  }

  const normalizedPath = assetPath.replace(/^\/+/, '');
  return new URL(normalizedPath, window.location.href).toString();
}

// Route utilities for determining which pages should get the Base44 AppShell
// Framework-agnostic helpers for internal route detection

// Internal routes that should get the AppShell (authenticated, sidebar-enabled)
export const INTERNAL_ROUTE_PREFIXES = [
  '/dashboard',
  '/dashboard/profile',
  '/dashboard/email-settings',
  '/dashboard/users',
  '/dashboard/content-lab',
  '/dashboard/triage',
  '/dashboard/articles',
  '/dashboard/history',
  '/dashboard/template'
] as const;

/**
 * Normalizes a pathname for consistent comparison
 * @param pathname - The raw pathname to normalize
 * @returns Normalized pathname (trimmed, starts with /, no trailing slash except single /)
 */
export function normalizePath(pathname: string): string {
  // Trim whitespace and ensure it starts with /
  let normalized = pathname.trim();
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  
  // Remove trailing slash except for single /
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  
  // Strip query parameters and hash fragments
  normalized = normalized.split('?')[0].split('#')[0];
  
  return normalized;
}

/**
 * Determines if a route should get the Base44 AppShell
 * @param pathname - The current pathname (e.g., "/dashboard", "/login")
 * @returns true if the route should get the AppShell, false otherwise
 */
export function isInternalRoute(pathname: string): boolean {
  const normalizedPath = normalizePath(pathname);
  
  // Check if the pathname starts with any internal route prefix
  return INTERNAL_ROUTE_PREFIXES.some(prefix => normalizedPath.startsWith(prefix));
}

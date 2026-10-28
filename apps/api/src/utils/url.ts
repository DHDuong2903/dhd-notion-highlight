const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'ref',
  'source',
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
  '_ga',
  'igshid',
]);

/**
 * Normalizes and canonicalizes a URL string.
 * - Strips fragments (#)
 * - Removes tracking query parameters
 * - Lowercases hostname
 * - Normalizes trailing slash (removes except for root path)
 */
export function canonicalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim());

    // Lowercase hostname
    parsed.hostname = parsed.hostname.toLowerCase();

    // Remove hash/fragment
    parsed.hash = '';

    // Remove known tracking query parameters
    const searchParams = new URLSearchParams(parsed.search);
    const keysToDelete: string[] = [];

    for (const key of searchParams.keys()) {
      if (TRACKING_PARAMS.has(key.toLowerCase()) || key.toLowerCase().startsWith('utm_')) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      searchParams.delete(key);
    }

    // Sort query parameters deterministically
    searchParams.sort();
    const cleanSearch = searchParams.toString();
    parsed.search = cleanSearch ? `?${cleanSearch}` : '';

    // Normalize trailing slash on pathname
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }

    return parsed.toString();
  } catch {
    // If not a valid URL, return trimmed raw string
    return rawUrl.trim();
  }
}

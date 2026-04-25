/**
 * Always returns 'light' — dark theme has been removed from this app.
 * On web, Metro resolves this file instead of use-color-scheme.js,
 * so we must force light here too.
 */
export function useColorScheme() {
  return 'light';
}

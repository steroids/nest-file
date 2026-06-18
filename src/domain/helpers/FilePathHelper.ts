/**
 * Normalizes a relative file path to the canonical format used across the module:
 * - forward slashes only (`/`);
 * - no leading slash;
 * - no duplicate separators.
 */
export function normalizeRelativePath(path: string): string {
    return path
        .replace(/\\/g, '/')
        .replace(/^\/+/, '')
        .replace(/\/{2,}/g, '/');
}

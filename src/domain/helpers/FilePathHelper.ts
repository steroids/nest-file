export class FilePathHelper {
    /**
     * Helper for canonicalizing relative file paths.
     *
     * Paths come from different sources (filesystem `path.join`, DB `join('/')`, S3 object keys)
     * and may differ in separator and leading slash, which breaks string-equality comparisons.
     * The canonical form used across the module is:
     *   - forward slashes only (`/`),
     *   - no leading slash,
     *   - no empty segments.
     *
     * Example: `normalizeRelativePath(null, 'sub', 'name.jpg')` => `'sub/name.jpg'`.
   */
    static normalizeRelativePath(...segments: Array<string | null | undefined>): string {
        return segments
            .filter(Boolean)
            .join('/')
            .replace(/\\/g, '/')
            .replace(/^\/+/, '')
            .replace(/\/{2,}/g, '/');
    }
}

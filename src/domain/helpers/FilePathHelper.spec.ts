import {FilePathHelper} from './FilePathHelper';

describe('FilePathHelper', () => {
    describe('normalizeRelativePath', () => {
        it('joins folder + fileName into a forward-slash relative path', () => {
            expect(FilePathHelper.normalizeRelativePath('sub', 'name.jpg'))
                .toBe('sub/name.jpg');
        });

        it('does not produce a leading slash when folder is null (regression: DB-side join bug)', () => {
            expect(FilePathHelper.normalizeRelativePath(null, 'name.jpg'))
                .toBe('name.jpg');
        });

        it('drops null/undefined/empty segments', () => {
            expect(FilePathHelper.normalizeRelativePath(null, undefined, '', 'name.jpg'))
                .toBe('name.jpg');
        });

        it('converts backslashes to forward slashes (Windows path.join output)', () => {
            expect(FilePathHelper.normalizeRelativePath('sub\\nested', 'name.jpg'))
                .toBe('sub/nested/name.jpg');
        });

        it('strips a leading slash from already-built paths', () => {
            expect(FilePathHelper.normalizeRelativePath('/name.jpg')).toBe('name.jpg');
            expect(FilePathHelper.normalizeRelativePath('///sub/name.jpg')).toBe('sub/name.jpg');
        });

        it('collapses duplicate separators', () => {
            expect(FilePathHelper.normalizeRelativePath('sub/', '/name.jpg')).toBe('sub/name.jpg');
            expect(FilePathHelper.normalizeRelativePath('a//b')).toBe('a/b');
        });

        it('returns empty string for no segments', () => {
            expect(FilePathHelper.normalizeRelativePath()).toBe('');
            expect(FilePathHelper.normalizeRelativePath(null, undefined, '')).toBe('');
        });

        it('canonical form is symmetric: same input from FS and DB sides match', () => {
            const fromDb = FilePathHelper.normalizeRelativePath(null, 'uid.original.jpg');
            const fromFs = FilePathHelper.normalizeRelativePath('uid.original.jpg');
            expect(fromDb).toBe(fromFs);
            expect(fromDb).toBe('uid.original.jpg');
        });
    });
});

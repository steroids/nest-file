import {normalizeRelativePath} from './FilePathHelper';

describe('normalizeRelativePath', () => {
    it('converts backslashes to forward slashes', () => {
        expect(normalizeRelativePath('sub\\nested\\name.jpg'))
            .toBe('sub/nested/name.jpg');
    });

    it('strips leading slashes', () => {
        expect(normalizeRelativePath('/name.jpg')).toBe('name.jpg');
        expect(normalizeRelativePath('///sub/name.jpg')).toBe('sub/name.jpg');
    });

    it('collapses duplicate separators', () => {
        expect(normalizeRelativePath('sub//name.jpg'))
            .toBe('sub/name.jpg');
        expect(normalizeRelativePath('a///b'))
            .toBe('a/b');
    });

    it('produces the same canonical path from different sources', () => {
        const fromDb = normalizeRelativePath('/uid.original.jpg');
        const fromStorage = normalizeRelativePath('uid.original.jpg');

        expect(fromDb).toBe(fromStorage);
        expect(fromDb).toBe('uid.original.jpg');
    });

    it('keeps an already normalized path unchanged', () => {
        expect(normalizeRelativePath('sub/name.jpg'))
            .toBe('sub/name.jpg');
    });
});

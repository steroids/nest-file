export class SharpHelper {
    static availableOutputImageOptions = [
        'jpeg',
        'png',
        'webp',
        'gif',
        'jp2',
        'tiff',
        'avif',
        'heif',
        'jxl',
    ];

    static getImageOptionNameByMimeType(imageMimeType: string): string | null {
        const extension = imageMimeType.replace('image/', '');

        return this.availableOutputImageOptions.includes(extension) ? extension : null;
    }
}

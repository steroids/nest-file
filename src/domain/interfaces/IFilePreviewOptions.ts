export interface IFilePreviewOptions {
    enable: boolean,
    width: number,
    height: number,
    sharp?: {
        resize?: any,
        extend?: any,
        outputImageOptions?: {
            jpeg?: any,
            png?: any,
            webp?: any,
            gif?: any,
            jp2?: any,
            tiff?: any,
            avif?: any,
            heif?: any,
            jxl?: any,
        },
    }
    [key: string]: any,
}

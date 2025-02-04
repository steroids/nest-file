export interface IFilePreviewOptions {
    enable: boolean,
    width: number,
    height: number,
    rotate: boolean,
    sharp?: {
        resize?: any,
        extend?: any,
        /** Настройки кропа изображения (извлечение прямоугольной области) */
        extract?: {
            /** Смещенее от левого края (начиная с нулевого индекса) */
            left: number,
            /** Смещенее от верхнего края (начиная с нулевого индекса) */
            top: number,
            /** Ширина региона для кропа */
            width: number,
            /** Высота региона для кропа */
            height: number,
        },
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

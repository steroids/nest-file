export interface IFilePreviewOptions {
    enable: boolean,
    width: number,
    height: number,
    sharp?: {
        resize?: any,
        extend?: any,
    }
    [key: string]: any,
}

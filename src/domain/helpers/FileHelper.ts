export class FileHelper {
    static addPreviewSuffix(fileName: string, previewName: string) {
        return fileName.replace(/\.[^.]+$/, `.${previewName}$&`);
    }
}

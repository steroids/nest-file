export class FileHelper {
    static addPreviewSuffix(fileName, previewName) {
        return fileName.replace(/\.[^.]+$/, `.${previewName}$&`);
    }
}

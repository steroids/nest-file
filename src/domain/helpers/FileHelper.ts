import * as fs from 'fs';
import * as Sentry from '@sentry/node';

export class FileHelper {
    static addPreviewSuffix(fileName, previewName) {
        return fileName.replace(/\.[^.]+$/, `.${previewName}$&`);
    }

    static async getFileNamesFromDir(pathToDir: string): Promise<string[] | null> {
        try {
            return await fs.promises.readdir(pathToDir);
        } catch (error) {
            Sentry.captureException(error);
            return null;
        }
    }

    static deleteFile(pathToFile: string): void {
        try {
            fs.rmSync(pathToFile);
        } catch (error) {
            Sentry.captureException(error);
        }
    }
}

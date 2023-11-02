import * as Sentry from '@sentry/node';
import {FileImageService} from './FileImageService';
import {FileService} from './FileService';
import {FileStorageFabric} from './FileStorageFabric';
import {IFileLocalStorage} from '../interfaces/IFileLocalStorage';
import {FileStorage} from '../enums/FileStorageEnum';

export class DeleteLostAndTemporaryFilesService {
    constructor(
        private fileService: FileService,
        private fileImageService: FileImageService,
        private fileStorageFabric: FileStorageFabric,
    ) {}

    /**
     * @dev This feature is currently only available for local storage.
     * To implement work with s3 you need:
     * - extend IFileStorage interface with methods of IFileLocalStorage interface
     * - in MinioS3Storage class implement extended IFileStorage interface
     * - return in getStorage() method object that implements IFileStorage interface
     */
    async deleteLostAndTemporaryFiles(storageName: FileStorage): Promise<void> {
        const storage = this.getStorage(storageName);

        if (!storage) {
            return;
        }

        const fileNamesFromStorage = storage.getFileNames();

        if (!fileNamesFromStorage) {
            return;
        }

        const fileNamesFromDb = [
            ...await this.fileImageService.getFileNamesFromDb(storageName),
            ...await this.fileService.getFileNamesFromDb(storageName),
        ];

        for (const fileName of fileNamesFromStorage) {
            if (!fileNamesFromDb.includes(fileName)) {
                storage.deleteFile(fileName);
            }
        }
    }

    private getStorage(storageName: FileStorage): IFileLocalStorage {
        try {
            return this.fileStorageFabric.get(storageName) as IFileLocalStorage;
        } catch (error) {
            Sentry.captureException(error);
            return null;
        }
    }
}

import * as Sentry from '@sentry/node';
import {FileImageService} from './FileImageService';
import {FileService} from './FileService';
import {IFileLocalStorage} from '../interfaces/IFileLocalStorage';
import {IFIleStorageFactory} from '../interfaces/IFIleStorageFactory';
import FileStorageEnum from '../enums/FileStorageEnum';

export class DeleteLostAndTemporaryFilesService {
    constructor(
        private fileService: FileService,
        private fileImageService: FileImageService,
        private fileStorageFactory: IFIleStorageFactory,
    ) {}

    /**
     * @dev This feature is currently only available for local storage.
     * To implement work with s3 you need:
     * - extend IFileStorage interface with methods of IFileLocalStorage interface
     * - in MinioS3Storage class implement extended IFileStorage interface
     * - return in getStorage() method object that implements IFileStorage interface
     */
    async deleteLostAndTemporaryFiles(storageName: FileStorageEnum): Promise<void> {
        const storage = this.getStorage(storageName);

        if (!storage) {
            return;
        }

        const filePathsFromStorage = storage.getFilesPaths();

        if (!filePathsFromStorage) {
            return;
        }

        const filesPathsFromDb = [
            ...await this.fileImageService.getFilesPathsFromDb(storageName),
            ...await this.fileService.getFilesPathsFromDb(storageName),
        ];

        for (const filePath of filePathsFromStorage) {
            if (!filesPathsFromDb.includes(filePath)) {
                storage.deleteFile(filePath);
            }
        }
    }

    private getStorage(storageName: FileStorageEnum): IFileLocalStorage {
        try {
            return this.fileStorageFactory.get(storageName) as IFileLocalStorage;
        } catch (error) {
            Sentry.captureException(error);
            return null;
        }
    }
}

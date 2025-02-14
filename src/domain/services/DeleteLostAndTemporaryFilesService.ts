import * as Sentry from '@sentry/node';
import {FileImageService} from './FileImageService';
import {FileService} from './FileService';
import {IFileLocalStorage} from '../interfaces/IFileLocalStorage';
import {IFileStorageFactory} from '../interfaces/IFileStorageFactory';
import FileStorageEnum from '../enums/FileStorageEnum';

export class DeleteLostAndTemporaryFilesService {
    constructor(
        private fileService: FileService,
        private fileImageService: FileImageService,
        private fileStorageFactory: IFileStorageFactory,
    ) {}

    /**
     * @dev This feature is currently only available for local storage.
     * To implement work with s3 you need:
     * - extend IFileStorage interface with methods of IFileLocalStorage interface
     * - in MinioS3Storage class implement extended IFileStorage interface
     * - return in getStorage() method object that implements IFileStorage interface
     */
    async deleteLostAndTemporaryFiles(storageName: FileStorageEnum): Promise<void> {
        const lostAndTemporaryFilesPaths = await this.getLostAndTemporaryFilesPaths(storageName);
        const storage = this.getStorage(storageName);
        if (storage) {
            lostAndTemporaryFilesPaths.forEach(storage.deleteFile);
        }
    }

    async getLostAndTemporaryFilesPaths(storageName: FileStorageEnum): Promise<string[]> {
        const storage = this.getStorage(storageName);

        if (!storage) {
            return [];
        }

        const filePathsFromStorage = storage.getFilesPaths();

        if (!filePathsFromStorage) {
            return [];
        }

        const filesPathsFromDb = [
            ...await this.fileImageService.getFilesPathsFromDb(storageName),
            ...await this.fileService.getFilesPathsFromDb(storageName),
        ];

        const lostAndTemporaryFilesPaths = [];

        for (const filePath of filePathsFromStorage) {
            if (!filesPathsFromDb.includes(filePath)) {
                lostAndTemporaryFilesPaths.push(filePath);
            }
        }

        return lostAndTemporaryFilesPaths;
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

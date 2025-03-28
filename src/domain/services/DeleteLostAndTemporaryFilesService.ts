import * as Sentry from '@sentry/node';
import {IFileLocalStorage} from '../interfaces/IFileLocalStorage';
import {GetFileModelsPathUsecase} from '../../usecases/getFilePathModels/GetFileModelsPathUsecase';
import {IFileStorageFactory} from '../interfaces/IFileStorageFactory';
import FileStorageEnum from '../enums/FileStorageEnum';

export class DeleteLostAndTemporaryFilesService {
    constructor(
        private fileStorageFactory: IFileStorageFactory,
        private getFileModelsPathUsecase: GetFileModelsPathUsecase,
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
        const lostAndTemporaryFilesPaths = await this.getLostAndTemporaryFilesPaths(storageName);
        for (const filePath of lostAndTemporaryFilesPaths) {
            await storage.deleteFile(filePath);
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

        const fileModelsPaths = await this.getFileModelsPathUsecase.handle(storageName);

        const lostAndTemporaryFilesPaths = [];

        for (const filePath of filePathsFromStorage) {
            if (!fileModelsPaths.includes(filePath)) {
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

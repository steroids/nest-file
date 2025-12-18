import * as Sentry from '@sentry/node';
import {Inject, Optional} from '@nestjs/common';
import {IFileLocalStorage} from '../interfaces/IFileLocalStorage';
import {IFileStorageFactory} from '../interfaces/IFileStorageFactory';
import FileStorageEnum from '../enums/FileStorageEnum';
import {
    GetFileModelsPathUsecaseToken,
    IGetFileModelsPathUsecase,
} from '../../usecases/getFilePathModels/interfaces/IGetFileModelsPathUsecase';
import {FileConfigService} from './FileConfigService';

async function isFileJustCreated(storage: IFileLocalStorage, filePath: string, currentTimeMs: number, justUploadedFileLifetimeMs: number) {
    let createTimeFileMs: number;
    try {
        createTimeFileMs = await storage.getFileCreateTimeMs(filePath);
    } catch (error) {
        Sentry.captureException(error);
    }

    return (currentTimeMs - createTimeFileMs) < justUploadedFileLifetimeMs;
}

export class DeleteLostAndTemporaryFilesService {
    constructor(
        @Inject(IFileStorageFactory)
        private fileStorageFactory: IFileStorageFactory,
        @Inject(FileConfigService)
        protected readonly fileConfigService: FileConfigService,
        @Optional() @Inject(GetFileModelsPathUsecaseToken)
        private getFileModelsPathUsecase: IGetFileModelsPathUsecase,
    ) {
    }

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
        const currentTimeMs = (new Date()).getTime();
        const lostAndTemporaryFilesPaths = await this.getLostAndTemporaryFilesPaths(storageName);
        for (const filePath of lostAndTemporaryFilesPaths) {
            try {
                if (!(await isFileJustCreated(storage, filePath, currentTimeMs, this.fileConfigService.justUploadedTempFileLifetimeMs))) {
                    await storage.deleteFile(filePath);
                }
            } catch (er) {
                /* empty */
            }
        }
    }

    async getLostAndTemporaryFilesPaths(storageName: FileStorageEnum): Promise<string[]> {
        if (!this.getFileModelsPathUsecase) {
            throw new Error('GetFileModelsPathUsecase is not provided');
        }

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

import {join} from 'path';
import * as Sentry from '@sentry/node';
import {FileImageService} from './FileImageService';
import {FileService} from './FileService';
import {FileStorageFabric} from './FileStorageFabric';
import {FileHelper} from '../helpers/FileHelper';
import {IFileLocalStorage} from '../interfaces/IFileLocalStorage';
import FileStorageEnum from '../enums/FileStorageEnum';

function getPathToLocalStorage(fileStorageFabric: FileStorageFabric): string | null {
    let localStorage: IFileLocalStorage;

    try {
        localStorage = fileStorageFabric.get(FileStorageEnum.LOCAL) as IFileLocalStorage;
        return localStorage.rootPath;
    } catch (error) {
        Sentry.captureException(error);
        return null;
    }
}

export class DeleteLostAndTemporaryFilesService {
    constructor(
        private fileService: FileService,
        private fileImageService: FileImageService,
        private fileStorageFabric: FileStorageFabric,
    ) {}

    async deleteLostAndTemporaryFiles(): Promise<void> {
        const pathToLocalStorage = getPathToLocalStorage(this.fileStorageFabric);
        if (!pathToLocalStorage) {
            return;
        }

        const fileNamesFromLocalStorage = await FileHelper.getFileNamesFromDir(pathToLocalStorage);

        const fileNamesFromDb = [
            ...await this.fileImageService.getLocalStorageFileNamesFromDb(),
            ...await this.fileService.getLocalStorageFileNamesFromDb(),
        ];

        for (const fileName of fileNamesFromLocalStorage) {
            if (!fileNamesFromDb.includes(fileName)) {
                const pathToFile = join(pathToLocalStorage, fileName);
                FileHelper.deleteFile(pathToFile);
            }
        }
    }
}

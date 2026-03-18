import {ICrudRepository} from '@steroidsjs/nest/usecases/interfaces/ICrudRepository';
import {FileModel} from '../models/FileModel';
import {FileStorageNameType} from '../types/FileStorageNameType';

export const IFileRepository = 'IFileRepository';

export interface IFileRepository extends ICrudRepository<FileModel> {
    getFileWithDocument: (fileName: string) => Promise<FileModel>,
    getFilesPathsByStorageName: (storageName: FileStorageNameType) => Promise<string[] | null>,
    getUnusedFilesIds: (config: {
        fileNameLike: string,
        ignoredTables: string[],
        isEmpty: boolean,
    }) => Promise<number[]>,
    getCount: () => Promise<number>,
}

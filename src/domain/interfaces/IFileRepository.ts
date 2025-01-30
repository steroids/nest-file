import {ICrudRepository} from '@steroidsjs/nest/usecases/interfaces/ICrudRepository';
import {FileModel} from '../models/FileModel';
import FileStorageEnum from '../enums/FileStorageEnum';

export const IFileRepository = 'IFileRepository';

export interface IFileRepository extends ICrudRepository<FileModel> {
    getFileWithDocument: (fileName: string) => Promise<FileModel>;
    getFilesPathsByStorageName: (storageName: FileStorageEnum) => Promise<string[] | null>;
    getJunkFilesIds: (config: {
        fileNameLike: string,
        ignoredTables: string[],
        isEmpty: boolean,
    }) => Promise<number[]>,
    getCount: () => Promise<number>,
}

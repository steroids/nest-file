import {ICrudRepository} from '@steroidsjs/nest/usecases/interfaces/ICrudRepository';
import {FileModel} from '../models/FileModel';

export const IFileRepository = 'IFileRepository';

export interface IFileRepository extends ICrudRepository<FileModel> {
    getFileWithDocument: (fileName: string) => Promise<FileModel>,
    getFilesPathsByStorageName: (storageName: string) => Promise<string[] | null>,
    getUnusedFilesIds: (config: {
        fileNameLike: string,
        ignoredTables: string[],
        isEmpty: boolean,
    }) => Promise<number[]>,
    getCount: () => Promise<number>,
}

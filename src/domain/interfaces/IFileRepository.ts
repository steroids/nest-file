import {ICrudRepository} from '@steroidsjs/nest/usecases/interfaces/ICrudRepository';
import {FileModel} from '../models/FileModel';
import {FileStorage} from '../enums/FileStorageEnum';

export const IFileRepository = 'IFileRepository';

export interface IFileRepository extends ICrudRepository<FileModel> {
    getFileWithDocument: (fileName: string) => Promise<FileModel>;
    getFilesPathsByStorageName: (storageName: FileStorage) => Promise<string[] | null>;
}

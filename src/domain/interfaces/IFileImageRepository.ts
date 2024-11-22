import {ICrudRepository} from '@steroidsjs/nest/usecases/interfaces/ICrudRepository';
import {FileImageModel} from '../models/FileImageModel';
import {FileStorage} from '../enums/FileStorageEnum';

export const IFileImageRepository = 'IFileImageRepository';

export interface IFileImageRepository extends ICrudRepository<FileImageModel> {
    getFilesPathsByStorageName: (storageName: FileStorage) => Promise<string[] | null>;
}

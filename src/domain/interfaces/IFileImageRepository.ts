import {ICrudRepository} from '@steroidsjs/nest/usecases/interfaces/ICrudRepository';
import {FileImageModel} from '../models/FileImageModel';
import {FileStorageNameType} from '../types/FileStorageNameType';

export const IFileImageRepository = 'IFileImageRepository';

export interface IFileImageRepository extends ICrudRepository<FileImageModel> {
    getFilesPathsByStorageName: (storageName: FileStorageNameType) => Promise<string[] | null>,
}

import {ICrudRepository} from '@steroidsjs/nest/usecases/interfaces/ICrudRepository';
import {FileImageModel} from '../models/FileImageModel';

export const IFileImageRepository = 'IFileImageRepository';

export interface IFileImageRepository extends ICrudRepository<FileImageModel> {
    getFileNamesByStorageName: (storageName: string) => Promise<string[] | null>;
}

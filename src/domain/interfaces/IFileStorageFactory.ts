import {IFileStorage} from './IFileStorage';

export const IFileStorageFactory = 'IFileStorageFactory';

export interface IFileStorageFactory {
    get: (name: string) => IFileStorage,
}

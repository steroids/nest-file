import {FileStorageEnum} from '../enums/FileStorageEnum';
import {IFileStorage} from './IFileStorage';

export const IFileStorageFactory = 'IFileStorageFactory';

export interface IFileStorageFactory {
    get: (name: FileStorageEnum) => IFileStorage;
}

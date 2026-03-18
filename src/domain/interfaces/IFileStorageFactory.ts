import {FileStorageNameType} from '../types/FileStorageNameType';
import {IFileStorage} from './IFileStorage';

export const IFileStorageFactory = 'IFileStorageFactory';

export interface IFileStorageFactory {
    get: (name: FileStorageNameType) => IFileStorage,
}

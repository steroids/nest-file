import { FileStorageEnum } from '../enums/FileStorageEnum';
import { IFileStorage } from './IFileStorage';

export const IFIleStorageFactory = 'IFIleStorageFactory';

export interface IFIleStorageFactory {
    get: (name: FileStorageEnum) => IFileStorage;
}

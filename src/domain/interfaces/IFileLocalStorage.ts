import {IFileStorage} from './IFileStorage';

export interface IFileLocalStorage extends IFileStorage {
    getFileNames(): string[] | null;
}

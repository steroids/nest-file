import {IFileStorage} from './IFileStorage';

export interface IFileLocalStorage extends IFileStorage {
    getFilesPaths(): string[] | null;
}

import {IFileStorage} from './IFileStorage';

export interface IFileLocalStorage extends IFileStorage {
    rootPath: string;
}

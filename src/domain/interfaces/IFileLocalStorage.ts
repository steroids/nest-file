import {IFileStorage} from './IFileStorage';

export interface IFileLocalStorage extends IFileStorage {
    getFilesPaths(): string[] | null,
    getFileCreateTimeMs(fileName: string): Promise<number>,
}

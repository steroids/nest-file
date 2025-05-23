import {IFileReadable} from './IFileReadable';

export interface IFileWritable extends IFileReadable {
    fileSize: number,
    fileMimeType: string,
}

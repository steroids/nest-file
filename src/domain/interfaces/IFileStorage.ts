import {Readable} from 'stream';
import {FileWriteResult} from '../dtos/FileWriteResult';
import {IFileReadable} from './IFileReadable';
import {IFileWritable} from './IFileWritable';

export interface IFileStorage {
    init(config: any),
    read(file: IFileReadable): Promise<Buffer>,
    write(
        file: IFileWritable,
        source: Readable | Buffer,
        fileStorageParams?: Record<string, any>,
    ): Promise<FileWriteResult>,
    getUrl(file: IFileReadable): string,
    deleteFile(fileName: string): void | Promise<void>,
}

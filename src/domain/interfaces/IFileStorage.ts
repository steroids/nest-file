import {Readable} from 'stream';
import {FileWriteResult} from '../dtos/FileWriteResult';
import {FileStorageNameType} from '../types/FileStorageNameType';
import {IFileReadable} from './IFileReadable';
import {IFileWritable} from './IFileWritable';

export interface IFileStorage {
    init(config: any),
    read(file: IFileReadable): Promise<Buffer>,
    write(
        file: IFileWritable,
        source: Readable | Buffer,
    ): Promise<FileWriteResult>,
    getUrl(file: IFileReadable): string,
    deleteFile(fileName: string): void | Promise<void>,
    storageName?: FileStorageNameType,
}

export const FILE_STORAGES_TOKEN = 'file_storages_token';

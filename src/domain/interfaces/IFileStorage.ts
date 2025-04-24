import {Readable} from 'stream';
import {FileWriteResult} from '../dtos/FileWriteResult';
import {IFile} from './IFile';

export interface IFileStorage {
    init(config: any)
    read(file: IFile): Promise<Buffer>
    write(file: IFile, source: Readable | Buffer): Promise<FileWriteResult>
    getUrl(file: IFile): string
    deleteFile(fileName: string): void | Promise<void>;
}

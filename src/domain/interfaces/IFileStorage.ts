import {Readable} from 'stream';
import {FileSaveDto} from '../dtos/FileSaveDto';
import {FileWriteResult} from '../dtos/FileWriteResult';
import {FileModel} from '../models/FileModel';
import {FileImageModel} from '../models/FileImageModel';

export interface IFileStorage {
    init(config: any)
    read(fileModel: FileModel): Promise<Buffer>
    write(fileSaveDto: FileSaveDto, source: Readable | Buffer): Promise<FileWriteResult>
    getUrl(fileModel: FileModel | FileImageModel): string
    deleteFile(fileName: string): void | Promise<void>;
}

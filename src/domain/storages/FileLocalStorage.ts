import {Readable} from 'stream';
import {join} from 'path';
import * as fs from 'fs';
import * as md5File from 'md5-file';
import {DataMapper} from '@steroidsjs/nest/usecases/helpers/DataMapper';
import * as Sentry from '@sentry/node';
import {FileSaveDto} from '../dtos/FileSaveDto';
import {FileWriteResult} from '../dtos/FileWriteResult';
import {FileModel} from '../models/FileModel';
import {FileImageModel} from '../models/FileImageModel';
import {IFileLocalStorage} from '../interfaces/IFileLocalStorage';
import * as path from 'node:path';

export class FileLocalStorage implements IFileLocalStorage {
    /**
     * Absolute path to root user files dir
     */
    public rootPath: string;

    /**
     * Absolute url to root user files dir
     */
    public rootUrl: string;

    public init(config: any) {
        this.rootPath = config?.rootPath;
        this.rootUrl = config?.rootUrl;

        if (!this.rootPath) {
            throw new Error('Not found file root path');
        }
    }

    public async read(fileModel: FileModel): Promise<Buffer> {
        const path = join(...[this.rootPath, fileModel.folder, fileModel.fileName].filter(Boolean));
        return fs.promises.readFile(path);
    }

    public async write(fileSaveDto: FileSaveDto, source: Readable | Buffer): Promise<FileWriteResult> {
        const dir = join(...[this.rootPath, fileSaveDto.folder].filter(Boolean));

        // Create dir
        if (!fs.existsSync(dir)) {
            await fs.promises.mkdir(dir, {recursive: true});
        }

        const path = join(dir, fileSaveDto.fileName);
        await fs.promises.writeFile(path, source, 'utf8');

        return DataMapper.create<FileWriteResult>(FileWriteResult, {
            md5: await md5File(path),
        });
    }

    public getUrl(fileModel: FileModel | FileImageModel): string {
        return [this.rootUrl, fileModel.folder, fileModel.fileName].filter(Boolean).join('/');
    }

    getFilesPaths(relativePath = ''): string[] | null {
        try {
            const folderPath = path.join(this.rootPath, relativePath);
            const files = fs.readdirSync(folderPath);
            let results = [];

            files.forEach(file => {
                const filePath = path.join(folderPath, file);
                const fileRelativePath = path.join(relativePath, file);
                const stat = fs.statSync(filePath);

                if (stat.isDirectory()) {
                    results = results.concat(this.getFilesPaths(fileRelativePath));
                } else {
                    results.push(fileRelativePath);
                }
            });

            return results;
        } catch (error) {
            console.error(error);
            Sentry.captureException(error);
            return null;
        }
    }

    deleteFile(filePath: string): void {
        const pathToFile = join(this.rootPath, filePath);
        try {
            fs.rmSync(pathToFile);
        } catch (error) {
            Sentry.captureException(error);
        }
    }
}

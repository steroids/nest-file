import {Readable} from 'stream';
import {join} from 'path';
import * as fs from 'fs';
import * as md5File from 'md5-file';
import {DataMapper} from '@steroidsjs/nest/usecases/helpers/DataMapper';
import * as Sentry from '@sentry/node';
import {FileWriteResult} from '../dtos/FileWriteResult';
import {IFileLocalStorage} from '../interfaces/IFileLocalStorage';
import {IFileReadable} from '../interfaces/IFileReadable';
import {IFileWritable} from '../interfaces/IFileWritable';

const DEFAULT_FILE_ENCODING: BufferEncoding = 'utf8';

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

    public async read(file: IFileReadable): Promise<Buffer> {
        const filePath = join(...[this.rootPath, file.folder, file.fileName].filter(Boolean));
        return fs.promises.readFile(filePath);
    }

    public async write(
        file: IFileWritable,
        source: Readable | Buffer,
        fileStorageParams: Record<string, any> | null = {},
    ): Promise<FileWriteResult> {
        const dir = join(...[this.rootPath, file.folder].filter(Boolean));

        // Create dir
        if (!fs.existsSync(dir)) {
            await fs.promises.mkdir(dir, {recursive: true});
        }

        const filePath = join(dir, file.fileName);

        const options = {
            encoding: DEFAULT_FILE_ENCODING,
            ...fileStorageParams,
        };

        await fs.promises.writeFile(filePath, source, options);

        return DataMapper.create<FileWriteResult>(FileWriteResult, {
            md5: await md5File(filePath),
        });
    }

    public getUrl(file: IFileReadable): string {
        return [this.rootUrl, file.folder, file.fileName].filter(Boolean).join('/');
    }

    getFilesPaths(relativePath = ''): string[] | null {
        try {
            const folderPath = join(this.rootPath, relativePath);
            const files = fs.readdirSync(folderPath);
            let results = [];

            files.forEach(file => {
                const filePath = join(folderPath, file);
                const fileRelativePath = join(relativePath, file);
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

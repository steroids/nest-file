import {toInteger as _toInteger} from 'lodash';
import {Readable} from 'stream';
import * as Minio from 'minio';
import {DataMapper} from '@steroidsjs/nest/usecases/helpers/DataMapper';
import {normalizeBoolean} from '@steroidsjs/nest/infrastructure/decorators/fields/BooleanField';
import {IFileStorage} from '../interfaces/IFileStorage';
import {FileSaveDto} from '../dtos/FileSaveDto';
import {FileWriteResult} from '../dtos/FileWriteResult';
import {FileModel} from '../models/FileModel';
import {FileImageModel} from '../models/FileImageModel';

export class MinioS3Storage implements IFileStorage {
    public host: string;

    public port: number;

    public isUseSsl: boolean;

    public accessKey: string;

    public secretKey: string;

    public region: string;

    public mainBucket: string;

    public rootUrl: string;

    private _client;

    private _isBucketCreated;

    public init(config: any) {
        this.host = config?.host;
        this.port = _toInteger(config?.port);
        this.isUseSsl = normalizeBoolean(config?.isUseSsl);
        this.accessKey = config?.accessKey;
        this.secretKey = config?.secretKey;
        this.region = config?.region;
        this.mainBucket = config?.mainBucket;
        this.rootUrl = config?.rootUrl;

        // if (!this.accessKey) {
        //     throw new Error('Not found accessKey for MinioS3Storage');
        // }
        // if (!this.secretKey) {
        //     throw new Error('Not found secretKey for MinioS3Storage');
        // }
    }

    public async read(fileModel: FileModel): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            // Get a full object.
            const chunks = [];
            this.getClient().getObject(
                this.mainBucket,
                [fileModel.folder, fileModel.fileName].filter(Boolean).join('/'),
                (err, dataStream) => {
                    if (err) {
                        reject(err);
                    } else {
                        dataStream.on('data', (chunk) => {
                            chunks.push(chunk);
                        });
                        dataStream.on('end', () => {
                            resolve(Buffer.concat(chunks));
                        });
                        dataStream.on('error', (err2) => {
                            reject(err2);
                        });
                    }
                },
            );
        });
    }

    public async write(fileSaveDto: FileSaveDto, source: Readable | Buffer): Promise<FileWriteResult> {
        await this.makeMainBucket();

        return new Promise((resolve, reject) => {
            this.getClient().putObject(
                this.mainBucket,
                [fileSaveDto.folder, fileSaveDto.fileName].filter(Boolean).join('/'),
                source,
                {
                    'Content-Type': fileSaveDto.fileMimeType || 'application/octet-stream',
                    Uid: fileSaveDto.uid || '',
                },
                (err, {etag}) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(
                            DataMapper.create<FileWriteResult>(FileWriteResult, {
                                md5: etag,
                            }),
                        );
                    }
                },
            );
        });
    }

    public getUrl(fileModel: FileModel | FileImageModel): string {
        return [this.rootUrl, fileModel.folder, fileModel.fileName].filter(Boolean).join('/');
    }

    protected makeMainBucket(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this._isBucketCreated) {
                resolve();
                return;
            }

            const client = this.getClient();
            client.bucketExists(this.mainBucket, (err, exists) => {
                if (err) {
                    reject(err);
                } else if (exists) {
                    resolve();
                } else {
                    client.makeBucket(this.mainBucket, this.region, err2 => {
                        if (err2) {
                            this._isBucketCreated = true;
                            reject(err2);
                        } else {
                            resolve();
                        }
                    });
                }
            });
        });
    }

    protected getClient() {
        if (!this._client) {
            this._client = new Minio.Client({
                endPoint: this.host,
                port: this.port,
                useSSL: this.isUseSsl,
                accessKey: this.accessKey,
                secretKey: this.secretKey,
            });
        }
        return this._client;
    }

    async deleteFile(fileName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const client = this.getClient();
            client.removeObject(this.mainBucket, fileName, (err: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

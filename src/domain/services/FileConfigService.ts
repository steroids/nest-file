import {toInteger as _toInteger} from 'lodash';
import {OnModuleInit} from '@nestjs/common';
import {join} from 'path';
import {CronExpression} from '@nestjs/schedule';
import {normalizeBoolean} from '@steroidsjs/nest/infrastructure/decorators/fields/BooleanField';
import FileStorageEnum from '../enums/FileStorageEnum';
import FilePreviewEnum from '../enums/FilePreviewEnum';
import {IFilePreviewOptions} from '../interfaces/IFilePreviewOptions';
import {IFileModuleConfig} from '../../infrastructure/config';

const getStoragesConfig = (storagesConfig: IFileModuleConfig['storages'] = {}) => {
    const localStorageConfig = {
        rootPath: process.env.APP_FILE_STORAGE_ROOT_PATH || join(process.cwd(), '../files/uploaded'),
        rootUrl: process.env.APP_FILE_STORAGE_ROOT_URL || '/files/uploaded',
        ...storagesConfig[FileStorageEnum.LOCAL],
    };
    const minioS3Config = {
        host: process.env.APP_FILE_STORAGE_S3_HOST || '127.0.0.1',
        port: process.env.APP_FILE_STORAGE_S3_PORT || '9000',
        isUseSsl: process.env.APP_FILE_STORAGE_S3_USE_SSL || '0',
        accessKey: process.env.APP_FILE_STORAGE_S3_ACCESS || '',
        secretKey: process.env.APP_FILE_STORAGE_S3_SECRET || '',
        region: process.env.APP_FILE_STORAGE_S3_REGION || 'us-east-1',
        mainBucket: process.env.APP_FILE_STORAGE_S3_MAIN_BUCKET || 'main',
        rootUrl: process.env.APP_FILE_STORAGE_ROOT_URL || '/files/uploaded',
        ...storagesConfig[FileStorageEnum.MINIO_S3],
    };

    delete storagesConfig[FileStorageEnum.LOCAL];
    delete storagesConfig[FileStorageEnum.MINIO_S3];

    return {
        [FileStorageEnum.LOCAL]: localStorageConfig,
        [FileStorageEnum.MINIO_S3]: minioS3Config,
        ...storagesConfig,
    };
};

export class FileConfigService implements OnModuleInit, IFileModuleConfig {
    /**
     * Default storage (local)
     * Env:
     *  - APP_FILE_STORAGE_NAME
     */
    public defaultStorageName: FileStorageEnum;

    /**
     * Configurations for storages
     * Env:
     *  - APP_FILE_STORAGE_ROOT_PATH
     *  - APP_FILE_STORAGE_ROOT_URL
     */
    public storages: {
        local?: {
            rootPath?: string,
            rootUrl?: string,
        },
        [key: string]: any,
    };

    /**
     * Configurations for create previews images
     * Env:
     *  - APP_FILE_PREVIEW_THUMBNAIL_WIDTH
     *  - APP_FILE_PREVIEW_THUMBNAIL_HEIGHT
     *  - APP_FILE_PREVIEW_ROTATE
     *  - APP_FILE_PREVIEW_STRETCH
     */
    public previews: {
        original?: IFilePreviewOptions,
        thumbnail?: IFilePreviewOptions,
    };

    /**
     * Max file size in megabyte (default: 32 Mb)
     * Env:
     *  - APP_FILE_MAX_SIZE_MB
     */
    public fileMaxSizeMb: number;

    /**
     * Default mime types for images
     */
    public imagesMimeTypes: string[];

    /**
     * Enable to store temporary uploaded files. Default behavior is deleting temporary files after upload
     * Temporary files are files downloaded locally to disk and intended for further loading into storage.
     */
    public saveTemporaryFileAfterUpload: boolean;

    /**
     * Enable to delete temporary and lost files by cron. This option is disabled by default.
     * Lost files are files whose information has been deleted from the database
     * but the files themselves still exist in the storage.
     *
     * IMPORTANT:
     * - when you enable this feature, temporary files will be deleted even if
     * saveTemporaryFileAfterUpload = true
     * - this functionality is currently only available for local storage
     * - to use this functionality you need import ScheduleModule into working project https://docs.nestjs.com/techniques/task-scheduling

     *
     * See cronTime patterns:
     * - https://www.npmjs.com/package/cron#cron-patterns
     * - https://github.com/nestjs/schedule/blob/master/lib/enums/cron-expression.enum.ts
     */
    public deleteLostAndTemporaryFilesByCron: {
        isEnable: boolean,
        cronTimePattern: string,
        storageName: FileStorageEnum,
    };

    /**
     * Enable to delete file from storage after deleting data about this file in database.
     * This option is disabled by default.
     */
    public deleteFileFromStorage: boolean;

    constructor(
        private custom: IFileModuleConfig,
    ) {
    }

    onModuleInit() {
        this.init(this.custom);
    }

    protected init(custom: IFileModuleConfig = {}) {
        // Default storage
        this.defaultStorageName = process.env.APP_FILE_STORAGE_NAME as FileStorageEnum
            || custom.defaultStorageName
            || FileStorageEnum.LOCAL;

        // Storages
        this.storages = getStoragesConfig(custom.storages);

        // Previews
        this.previews = {
            [FilePreviewEnum.ORIGINAL]: {
                enable: true,
                width: null,
                height: null,
                rotate: normalizeBoolean(process.env.APP_FILE_PREVIEW_ROTATE || false),
                ...custom.previews?.[FilePreviewEnum.ORIGINAL],
            },
            [FilePreviewEnum.THUMBNAIL]: {
                enable: true,
                width: process.env.APP_FILE_PREVIEW_THUMBNAIL_WIDTH || 500,
                height: process.env.APP_FILE_PREVIEW_THUMBNAIL_HEIGHT || 300,
                rotate: normalizeBoolean(process.env.APP_FILE_PREVIEW_ROTATE || false),
                ...custom.previews?.[FilePreviewEnum.THUMBNAIL],
            },
            ...custom.previews,
        };

        // File max size
        this.fileMaxSizeMb = _toInteger(process.env.APP_FILE_MAX_SIZE_MB || custom.fileMaxSizeMb || 32);

        // Mime-types for detect images
        this.imagesMimeTypes = custom.imagesMimeTypes || [
            'image/gif',
            'image/jpeg',
            'image/pjpeg',
            'image/png',
            'image/heif',
            'image/heic',
            'image/heif-sequence',
            'image/heic-sequence',
            'image/webp',
            'image/svg+xml',
        ];

        this.saveTemporaryFileAfterUpload = custom.saveTemporaryFileAfterUpload;

        this.deleteLostAndTemporaryFilesByCron = {
            isEnable: false,
            cronTimePattern: CronExpression.EVERY_12_HOURS,
            storageName: FileStorageEnum.LOCAL,
            ...custom.deleteLostAndTemporaryFilesByCron || {},
        };

        this.deleteFileFromStorage = custom.deleteFileFromStorage;
    }
}

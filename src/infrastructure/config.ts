import {ModuleHelper} from '@steroidsjs/nest/infrastructure/helpers/ModuleHelper';
import {IFileService} from '@steroidsjs/nest-modules/file/services/IFileService';
import {IFileRepository} from '../domain/interfaces/IFileRepository';
import {FileRepository} from './repositories/FileRepository';
import {IFileImageRepository} from '../domain/interfaces/IFileImageRepository';
import {FileImageRepository} from './repositories/FileImageRepository';
import {FileService} from '../domain/services/FileService';
import {FileImageService} from '../domain/services/FileImageService';
import {FileConfigService} from '../domain/services/FileConfigService';
import {FileMaxSizeValidator} from '../domain/validators/FileMaxSizeValidator';
import {FileMimeTypesValidator} from '../domain/validators/FileMimeTypesValidator';
import {FileStorageFabric} from '../domain/services/FileStorageFabric';
import {FileLocalStorage} from '../domain/storages/FileLocalStorage';
import {MinioS3Storage} from '../domain/storages/MinioS3Storage';
import FileStorageEnum from '../domain/enums/FileStorageEnum';
import {FileTable} from './tables/FileTable';
import {FileImageTable} from './tables/FileImageTable';
import FileController from './controllers/FileController';

export type IFileModuleConfig = Omit<Readonly<FileConfigService>, 'onModuleInit'>

export default {
    entities: [
        FileTable,
        FileImageTable,
    ],
    config: () => ({

    } as IFileModuleConfig),
    module: (config: IFileModuleConfig) => ({
        controllers: [
            FileController,
        ],
        providers: [
            {
                provide: IFileRepository,
                useClass: FileRepository,
            },
            {
                provide: IFileImageRepository,
                useClass: FileImageRepository,
            },
            {
                provide: FileConfigService,
                useFactory: () => new FileConfigService(config),
            },
            FileMaxSizeValidator,
            FileMimeTypesValidator,
            FileLocalStorage,
            MinioS3Storage,
            {
                inject: [FileConfigService, FileLocalStorage, MinioS3Storage],
                provide: FileStorageFabric,
                useFactory: (
                    fileConfigService,
                    fileLocalStorage,
                    minioS3Storage,
                ) => new FileStorageFabric(fileConfigService, {
                    [FileStorageEnum.LOCAL]: fileLocalStorage,
                    [FileStorageEnum.MINIO_S3]: minioS3Storage,
                }),
            },
            ModuleHelper.provide(FileService, IFileService, [
                IFileRepository,
                FileImageService,
                FileConfigService,
                FileStorageFabric,
                [
                    FileMimeTypesValidator,
                    FileMaxSizeValidator,
                ],
            ]),
            ModuleHelper.provide(FileImageService, [
                IFileImageRepository,
                FileConfigService,
                FileStorageFabric,
            ]),
        ],
        exports: [
            IFileService,
            FileImageService,
        ],
    }),
};

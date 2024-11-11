import {ModuleHelper} from '@steroidsjs/nest/infrastructure/helpers/ModuleHelper';
import {IFileService} from '@steroidsjs/nest-modules/file/services/IFileService';
import {EventEmitter2} from '@nestjs/event-emitter';
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
import FileController from './controllers/FileController';
import {IFileModuleConfig} from './config';
import {CronJobsRegister} from './services/CronJobsRegister';
import {DeleteLostAndTemporaryFilesService} from '../domain/services/DeleteLostAndTemporaryFilesService';
import {FileEventsSubscriber} from './subscribers/FileEventsSubscriber';
import { FileRemovedEventHandleUseCase } from '../usecases/fileRemovedEventHandleUseCase/FileRemovedEventHandleUseCase';

export default (config: IFileModuleConfig) => ({
    controllers: [
        FileController,
    ],
    providers: [
        // Repositories
        {
            provide: IFileRepository,
            useClass: FileRepository,
        },
        {
            provide: IFileImageRepository,
            useClass: FileImageRepository,
        },

        // Infrastructure services
        CronJobsRegister,

        // Validators
        FileMaxSizeValidator,
        FileMimeTypesValidator,

        // Storages
        FileLocalStorage,
        MinioS3Storage,

        // Services
        {
            provide: FileConfigService,
            useFactory: () => new FileConfigService(config),
        },
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
            EventEmitter2,
            [
                FileMimeTypesValidator,
                FileMaxSizeValidator,
            ],
        ]),
        ModuleHelper.provide(FileImageService, [
            IFileImageRepository,
            FileConfigService,
            FileStorageFabric,
            EventEmitter2,
        ]),

        ModuleHelper.provide(DeleteLostAndTemporaryFilesService, [
            IFileService,
            FileImageService,
            FileStorageFabric,
        ]),

        // Subscribers
        FileEventsSubscriber,

        // UseCases
        ModuleHelper.provide(FileRemovedEventHandleUseCase, [
            FileStorageFabric,
            FileConfigService,
        ]),
    ],
    exports: [
        IFileService,
        FileImageService,
    ],
});

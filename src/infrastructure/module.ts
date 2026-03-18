import {ModuleHelper} from '@steroidsjs/nest/infrastructure/helpers/ModuleHelper';
import {IFileService} from '@steroidsjs/nest-modules/file/services/IFileService';
import {EventEmitter2} from '@nestjs/event-emitter';
import {ModuleRef} from '@nestjs/core';
import {IFileRepository} from '../domain/interfaces/IFileRepository';
import {IFileImageRepository} from '../domain/interfaces/IFileImageRepository';
import {FileService} from '../domain/services/FileService';
import {FileImageService} from '../domain/services/FileImageService';
import {FileConfigService} from '../domain/services/FileConfigService';
import {FileMaxSizeValidator} from '../domain/validators/FileMaxSizeValidator';
import {FileMimeTypesValidator} from '../domain/validators/FileMimeTypesValidator';
import {FileStorageFactory} from '../domain/services/FileStorageFactory';
import {FileLocalStorage} from '../domain/storages/FileLocalStorage';
import {MinioS3Storage} from '../domain/storages/MinioS3Storage';
import FileStorageEnum from '../domain/enums/FileStorageEnum';
import {DeleteLostAndTemporaryFilesService} from '../domain/services/DeleteLostAndTemporaryFilesService';
import {FileRemovedEventHandleUseCase} from '../usecases/fileRemovedEventHandleUseCase/FileRemovedEventHandleUseCase';
import {IFileTypeService} from '../domain/interfaces/IFileTypeService';
import {FileTypeService} from '../domain/services/FileTypeService';
import {IFileStorageFactory} from '../domain/interfaces/IFileStorageFactory';
import {FILE_STORAGES_TOKEN} from '../domain/storages';
import {FileEventsSubscriber} from './subscribers/FileEventsSubscriber';
import {CronJobsRegister} from './services/CronJobsRegister';
import {IFileModuleConfig} from './config';
import {FileImageRepository} from './repositories/FileImageRepository';
import {FileRepository} from './repositories/FileRepository';
import {ClearUnusedFilesCommand} from './commands/ClearUnusedFilesCommand';

export default (config: IFileModuleConfig) => ({
    controllers: [],
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
            provide: IFileTypeService,
            useClass: FileTypeService,
        },

        {
            provide: FILE_STORAGES_TOKEN,
            inject: [ModuleRef],
            useFactory: async (moduleRef: ModuleRef) => ({
                [FileStorageEnum.LOCAL]: await moduleRef.resolve(FileLocalStorage),
                [FileStorageEnum.MINIO_S3]: await moduleRef.resolve(MinioS3Storage),
            }),
        },

        {
            provide: IFileStorageFactory,
            useClass: FileStorageFactory,
        },
        ModuleHelper.provide(FileService, IFileService, [
            IFileRepository,
            FileImageService,
            FileConfigService,
            IFileStorageFactory,
            EventEmitter2,
            IFileTypeService,
            [
                FileMimeTypesValidator,
                FileMaxSizeValidator,
            ],
        ]),
        ModuleHelper.provide(FileImageService, [
            IFileImageRepository,
            FileConfigService,
            IFileStorageFactory,
            EventEmitter2,
        ]),

        DeleteLostAndTemporaryFilesService,

        // Subscribers
        FileEventsSubscriber,

        // UseCases
        ModuleHelper.provide(FileRemovedEventHandleUseCase, [
            IFileStorageFactory,
            FileConfigService,
        ]),
        ClearUnusedFilesCommand,
    ],
    exports: [
        IFileService,
        FileImageService,
    ],
});

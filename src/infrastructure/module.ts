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
import {FileStorageFactory} from '../domain/services/FileStorageFactory';
import {FileLocalStorage} from '../domain/storages/FileLocalStorage';
import {MinioS3Storage} from '../domain/storages/MinioS3Storage';
import FileStorageEnum from '../domain/enums/FileStorageEnum';
import FileController from './controllers/FileController';
import {IFileModuleConfig} from './config';
import {CronJobsRegister} from './services/CronJobsRegister';
import {DeleteLostAndTemporaryFilesService} from '../domain/services/DeleteLostAndTemporaryFilesService';
import {FileEventsSubscriber} from './subscribers/FileEventsSubscriber';
import {FileRemovedEventHandleUseCase} from '../usecases/fileRemovedEventHandleUseCase/FileRemovedEventHandleUseCase';
import {IFileTypeService} from '../domain/interfaces/IFileTypeService';
import {FileTypeService} from '../domain/services/FileTypeService';
import {IFileStorageFactory} from '../domain/interfaces/IFileStorageFactory';
import {ClearUnusedFilesCommand} from './commands/ClearUnusedFilesCommand';

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
            provide: IFileTypeService,
            useClass: FileTypeService,
        },

        {
            inject: [FileConfigService, FileLocalStorage, MinioS3Storage],
            provide: IFileStorageFactory,
            useFactory: (
                fileConfigService: FileConfigService,
                fileLocalStorage: FileLocalStorage,
                minioS3Storage: MinioS3Storage,
            ) => new FileStorageFactory(fileConfigService, {
                [FileStorageEnum.LOCAL]: fileLocalStorage,
                [FileStorageEnum.MINIO_S3]: minioS3Storage,
            }),
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

        {
            provide: GetFileModelsPathUsecaseToken,
            // При использовании передавать GetFileModelsPathUsecase
            useClass: {},
        },

        ModuleHelper.provide(DeleteLostAndTemporaryFilesService, [
            IFileStorageFactory,
            GetFileModelsPathUsecaseToken,
        ]),

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

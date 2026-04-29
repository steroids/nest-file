import {IFileService} from '@steroidsjs/nest-modules/file/services/IFileService';
import {IValidator} from '@steroidsjs/nest/usecases/interfaces/IValidator';
import {IFileRepository} from '../domain/interfaces/IFileRepository';
import {IFileImageRepository} from '../domain/interfaces/IFileImageRepository';
import {FileService} from '../domain/services/FileService';
import {FileImageService} from '../domain/services/FileImageService';
import {FileConfigService} from '../domain/services/FileConfigService';
import {FileStorageFactory} from '../domain/services/FileStorageFactory';
import {FileLocalStorage} from '../domain/storages/FileLocalStorage';
import {MinioS3Storage} from '../domain/storages/MinioS3Storage';
import FileStorageEnum from '../domain/enums/FileStorageEnum';
import {DeleteLostAndTemporaryFilesService} from '../domain/services/DeleteLostAndTemporaryFilesService';
import {FileRemovedEventHandleUseCase} from '../usecases/fileRemovedEventHandleUseCase/FileRemovedEventHandleUseCase';
import {IFileTypeService} from '../domain/interfaces/IFileTypeService';
import {FileTypeService} from '../domain/services/FileTypeService';
import {IFileStorageFactory} from '../domain/interfaces/IFileStorageFactory';
import {fileValidators} from '../domain/validators';
import {FILE_VALIDATORS_TOKEN} from '../domain/constants/FileValidatorsToken';
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
        ...fileValidators,
        {
            provide: FILE_VALIDATORS_TOKEN,
            useFactory: (...providers: IValidator[]) => providers,
            inject: fileValidators,
        },

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
        {
            provide: IFileService,
            useClass: FileService,
        },
        {
            provide: FileImageService,
            useClass: FileImageService,
        },

        DeleteLostAndTemporaryFilesService,

        // Subscribers
        FileEventsSubscriber,

        // UseCases
        FileRemovedEventHandleUseCase,
        ClearUnusedFilesCommand,
    ],
    exports: [
        IFileService,
        FileImageService,
    ],
});

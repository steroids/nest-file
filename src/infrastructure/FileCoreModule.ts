import {DynamicModule, forwardRef, Module} from '@nestjs/common';
import {ModuleHelper} from '@steroidsjs/nest/infrastructure/helpers/ModuleHelper';
import {TypeOrmModule} from '@steroidsjs/nest-typeorm';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {FileModule} from '@steroidsjs/nest-modules/file/FileModule';
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

@Module({})
export class FileCoreModule {
    static forRoot(options): DynamicModule | any {
        return {
            module: FileModule,
            imports: [
                forwardRef(() => ConfigModule),
                TypeOrmModule.forFeature(ModuleHelper.importDir(__dirname + '/tables')),

            ],
            controllers: ModuleHelper.importDir(__dirname + '/controllers'),
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
                    inject: [ConfigService],
                    provide: FileConfigService,
                    useFactory: (configService) => new FileConfigService(configService.get('file')),
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
                ModuleHelper.provide(FileService, [
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
                FileService,
                FileImageService,
            ],
        };
    }
}

import {Inject, Injectable} from '@nestjs/common';
import {IFileService} from '@steroidsjs/nest-modules/file/services/IFileService';
import {FileService} from '../../domain/services/FileService';
import {FileImageService} from '../../domain/services/FileImageService';
import {FileStorageEnum} from '../../domain/enums/FileStorageEnum';
import {IGetFileModelsPathUsecase} from './interfaces/IGetFileModelsPathUsecase';

@Injectable()
export class GetFileModelsPathUsecase implements IGetFileModelsPathUsecase {
    constructor(
        @Inject(IFileService)
        protected readonly fileService: FileService,
        @Inject(FileImageService)
        protected readonly fileImageService: FileImageService,
    ) {}

    async handle(storageName: FileStorageEnum) {
        return [
            ...await this.fileImageService.getFilesPathsFromDb(storageName),
            ...await this.fileService.getFilesPathsFromDb(storageName),
        ];
    }
}

import {Inject, Injectable} from '@nestjs/common';
import {FileService} from '../../domain/services/FileService';
import {FileImageService} from '../../domain/services/FileImageService';
import {FileStorageEnum} from '../../domain/enums/FileStorageEnum';

@Injectable()
export class GetFileModelsPathUsecase {
    constructor(
        @Inject(FileService)
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

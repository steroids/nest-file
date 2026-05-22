import {Inject, Injectable} from '@nestjs/common';
import {FileService} from '../../domain/services/FileService';
import {FileImageService} from '../../domain/services/FileImageService';
import {IGetFileModelsPathUsecase} from './interfaces/IGetFileModelsPathUsecase';

@Injectable()
export class GetFileModelsPathUsecase implements IGetFileModelsPathUsecase {
    constructor(
        @Inject(FileService)
        protected readonly fileService: FileService,
        @Inject(FileImageService)
        protected readonly fileImageService: FileImageService,
    ) {}

    async handle(storageName: string) {
        return [
            ...await this.fileImageService.getFilesPathsFromDb(storageName),
            ...await this.fileService.getFilesPathsFromDb(storageName),
        ];
    }
}

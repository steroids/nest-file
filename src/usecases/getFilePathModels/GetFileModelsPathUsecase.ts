import {FileService} from '../../domain/services/FileService';
import {FileImageService} from '../../domain/services/FileImageService';
import {FileStorageEnum} from '../../domain/enums/FileStorageEnum';

export class GetFileModelsPathUsecase {
    constructor(
        protected readonly fileService: FileService,
        protected readonly fileImageService: FileImageService,
    ) {}

    async handle(storageName: FileStorageEnum) {
        return [
            ...await this.fileImageService.getFilesPathsFromDb(storageName),
            ...await this.fileService.getFilesPathsFromDb(storageName),
        ];
    }
}

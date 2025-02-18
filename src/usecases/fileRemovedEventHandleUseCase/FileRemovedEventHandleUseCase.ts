import * as Sentry from '@sentry/node';
import {FileConfigService} from '../../domain/services/FileConfigService';
import {FileRemovedEventDto} from '../../domain/dtos/events/FileRemovedEventDto';
import {IFIleStorageFactory} from '../../domain/interfaces/IFIleStorageFactory';

export class FileRemovedEventHandleUseCase {
    constructor(
        private readonly storageFactory: IFIleStorageFactory,
        private readonly fileConfigService: FileConfigService,
    ) {}

    public async handle(dto: FileRemovedEventDto) {
        if (!this.fileConfigService.deleteFileFromStorage) {
            return;
        }

        const storage = this.storageFactory.get(dto.storageName);

        const filePath = [
            dto.folder,
            dto.fileName,
        ].filter(Boolean).join('/');

        try {
            await storage.deleteFile(filePath);
        } catch (error) {
            console.error(error);
            Sentry.captureException(error);
        }
    }
}

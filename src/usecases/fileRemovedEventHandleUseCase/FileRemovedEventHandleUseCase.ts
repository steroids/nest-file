import * as Sentry from '@sentry/node';
import {FileStorageFabric} from '../../domain/services/FileStorageFabric';
import {FileConfigService} from '../../domain/services/FileConfigService';
import {FileRemovedEventDto} from '../../domain/dtos/events/FileRemovedEventDto';

export class FileRemovedEventHandleUseCase {
    constructor(
        private readonly storageFabric: FileStorageFabric,
        private readonly fileConfigService: FileConfigService,
    ) {}

    public async handle(dto: FileRemovedEventDto) {
        if (!this.fileConfigService.deleteFileFromStorage) {
            return;
        }

        const storage = this.storageFabric.get(dto.storageName);

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

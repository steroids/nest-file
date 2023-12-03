import {EntitySubscriberInterface, DataSource, RemoveEvent} from '@steroidsjs/typeorm';
import {Inject, Type} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import {FileStorageFabric} from '../../domain/services/FileStorageFabric';
import {FileConfigService} from '../../domain/services/FileConfigService';

/**
 * This interface contains the common FileModel and FileImageModel properties needed to delete files from storage.
 */
interface IFile {
    storageName: string;
    fileName: string;
}

/**
 * This Susbcriber is intended to remove files from storage, information about which has been deleted from the database.
 * Events are firing using QueryBuilder and repository/manager methods.
 * You can see more about subscribers:
 * - https://typeorm.io/listeners-and-subscribers#what-is-a-subscriber
 * - https://docs.nestjs.com/techniques/database#subscribers
 */
export abstract class BaseFileSubscriber<TTable, TModel extends IFile> implements EntitySubscriberInterface<TTable> {
    constructor(
        @Inject(FileStorageFabric) protected storageFabric: FileStorageFabric,
        @Inject(FileConfigService) private fileConfigService: FileConfigService,
        dataSource: DataSource,
    ) {
        dataSource.subscribers.push(this);
    }

    async afterRemove(event: RemoveEvent<TTable>): Promise<void> {
        if (!this.fileConfigService.deleteFileFromStorage) {
            return;
        }

        const removedModelInstance = this.getModelFromTable(event.databaseEntity);

        if (!removedModelInstance) {
            Sentry.captureMessage('After deleting information about file from database, invalid event was emitted');
            return;
        }

        const storage = this.storageFabric.get(removedModelInstance.storageName);

        try {
            await storage.deleteFile(removedModelInstance.fileName);
        } catch (error) {
            Sentry.captureException(error);
        }
    }

    abstract listenTo(): Type<TTable>;

    /**
     * Сonverts table object to desired model
     * @param removedTableInstance Database representation of entity that is being removed.
     * @returns Instance of model
     */
    protected abstract getModelFromTable(removedTableInstance: TTable): TModel;
}

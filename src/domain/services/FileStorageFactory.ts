import {FileConfigService} from './FileConfigService';
import {IFileStorage} from '../interfaces/IFileStorage';
import { FileStorageEnum } from '../enums/FileStorageEnum';
import { IFileStorageFactory } from '../interfaces/IFileStorageFactory';

export class FileStorageFactory implements IFileStorageFactory {
    private initializedNames: FileStorageEnum[] = [];

    constructor(
        private fileConfigService: FileConfigService,
        private storages: Record<FileStorageEnum, IFileStorage>,
    ) {
    }

    public get(name: FileStorageEnum = null): IFileStorage {
        name = name || this.fileConfigService.defaultStorageName as FileStorageEnum;

        if (!this.storages[name]) {
            throw new Error('Not found storage by name: ' + name);
        }

        const storage = this.storages[name];

        if (!this.initializedNames.includes(name)) {
            this.initializedNames.push(name);

            storage.init(this.fileConfigService.storages?.[name]);
        }

        return storage;
    }
}

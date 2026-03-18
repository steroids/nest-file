import {Inject, Injectable} from '@nestjs/common';
import {IFileStorage} from '../interfaces/IFileStorage';
import {IFileStorageFactory} from '../interfaces/IFileStorageFactory';
import {FileStorageNameType} from '../types/FileStorageNameType';
import {FILE_STORAGES_TOKEN} from '../storages';
import {FileConfigService} from './FileConfigService';

@Injectable()
export class FileStorageFactory implements IFileStorageFactory {
    private initializedNames: FileStorageNameType[] = [];

    constructor(
        private fileConfigService: FileConfigService,
        @Inject(FILE_STORAGES_TOKEN)
        private storages: Record<FileStorageNameType, IFileStorage>,
    ) {
    }

    public get(name: FileStorageNameType = null): IFileStorage {
        name = name || this.fileConfigService.defaultStorageName;

        if (!this.storages[name]) {
            throw new Error('Not found storage by name: ' + name);
        }

        const storage = this.storages[name];

        if (!this.initializedNames.includes(name)) {
            this.initializedNames.push(name);

            const storageConfig = this.fileConfigService.storages?.[name] ?? {storageName: name};
            storageConfig.storageName ??= name;

            storage.init(storageConfig);
        }

        return storage;
    }
}

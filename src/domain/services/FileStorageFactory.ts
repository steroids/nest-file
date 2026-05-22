import {Inject, Injectable} from '@nestjs/common';
import {FILE_STORAGES_TOKEN, IFileStorage} from '../interfaces/IFileStorage';
import {IFileStorageFactory} from '../interfaces/IFileStorageFactory';
import {FileConfigService} from './FileConfigService';

@Injectable()
export class FileStorageFactory implements IFileStorageFactory {
    private initializedNames: string[] = [];

    constructor(
        private fileConfigService: FileConfigService,
        @Inject(FILE_STORAGES_TOKEN)
        private storages: Record<string, IFileStorage>,
    ) {
    }

    public get(name: string = null): IFileStorage {
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

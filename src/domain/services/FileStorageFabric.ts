import {FileConfigService} from './FileConfigService';
import {IFileStorage} from '../interfaces/IFileStorage';

export class FileStorageFabric {
    private initializedNames: string[] = [];

    constructor(
        private fileConfigService: FileConfigService,
        private storages: any,
    ) {
    }

    public get(name = null): IFileStorage {
        name = name || this.fileConfigService.defaultStorageName;

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

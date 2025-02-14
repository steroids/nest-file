/* eslint-disable no-console */
import {Command, Option} from 'nestjs-command';
import {Inject, Injectable} from '@nestjs/common';
import {ModuleHelper} from '@steroidsjs/nest/infrastructure/helpers/ModuleHelper';
import {FileModule} from '@steroidsjs/nest-modules/file/FileModule';
import {IFileModuleConfig} from '../config';
import {DeleteLostAndTemporaryFilesService} from '../../domain/services/DeleteLostAndTemporaryFilesService';
import { FileStorage } from '../../domain/enums/FileStorageEnum';

@Injectable()
export class ClearLostAndTemporaryFilesCommand {
    constructor(
        @Inject(DeleteLostAndTemporaryFilesService)
        private deleteLostAndTemporaryFilesService: DeleteLostAndTemporaryFilesService,
    ) {
    }

    @Command({
        command: 'lost-files',
        describe: 'Remove lost files',
    })
    async processLostFiles(
        @Option({
            name: 'dry-run',
            describe: 'Is dry run?',
            type: 'boolean',
            alias: 'dr',
            demandOption: false,
        })
            isDryRun: boolean,
    ) {
        const config = ModuleHelper.getConfig<IFileModuleConfig>(FileModule);
        const storageName = config.defaultStorageName as FileStorage;
        const lostAndTemporaryFilesPaths = await this.deleteLostAndTemporaryFilesService
            .getLostAndTemporaryFilesPaths(storageName);

        console.log('Пути неудалённых файлов:');
        lostAndTemporaryFilesPaths.map(console.log);

        if (!isDryRun) {
            console.log('Удаление файлов...');
            await this.deleteLostAndTemporaryFilesService.deleteLostAndTemporaryFiles(storageName);
            console.log('Файлы удалены!');
        } else {
            console.log('Установлен флаг dry run, поэтому удаления файлов не произошло');
        }
    }
}

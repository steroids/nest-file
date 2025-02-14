/* eslint-disable no-console */
import {Command, Option} from 'nestjs-command';
import {Inject, Injectable} from '@nestjs/common';
import {DeleteLostAndTemporaryFilesService} from '../../domain/services/DeleteLostAndTemporaryFilesService';
import FileStorageEnum, {FileStorage} from '../../domain/enums/FileStorageEnum';

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
            name: 'storage',
            describe: 'File storage name',
            type: 'string',
            alias: 'st',
            demandOption: false,
            choices: FileStorageEnum.getKeys(),
            default: FileStorage.LOCAL,
        })
            storageName: FileStorage,

        @Option({
            name: 'dry-run',
            describe: 'Is dry run?',
            type: 'boolean',
            alias: 'dr',
            demandOption: false,
        })
            isDryRun: boolean,
    ) {
        const lostAndTemporaryFilesPaths = await this.deleteLostAndTemporaryFilesService
            .getLostAndTemporaryFilesPaths(storageName);

        if (!lostAndTemporaryFilesPaths.length) {
            console.log('Нет неудалённых файлов');
            return;
        }

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

/* eslint-disable no-console */
import {Command, Option} from 'nestjs-command';
import {Inject, Injectable} from '@nestjs/common';
import {FileService} from '../../domain/services/FileService';

@Injectable()
export class ClearUnusedFilesCommand {
    constructor(
        @Inject(FileService)
        private fileService: FileService,
    ) {
    }

    @Command({
        command: 'unused-files',
        describe: 'Remove unused files',
    })
    async processUnusedFiles(
        @Option({
            name: 'partial-name',
            describe: 'Partial file name',
            type: 'string',
            alias: 'pn',
            demandOption: false,
        })
            nameLike: string,

        @Option({
            name: 'ignored-tables',
            describe: 'The tables that need to be ignored when searching for the files used',
            type: 'array',
            alias: 'it',
            demandOption: false,
        })
            ignoredTables: string[],

        @Option({
            name: 'only-empty',
            describe: 'Files with size = 0',
            type: 'boolean',
            alias: 'oe',
            demandOption: false,
        })
            isEmpty: boolean,

        @Option({
            name: 'preview-limit',
            describe: 'Preview files limit',
            type: 'number',
            alias: 'pl',
            demandOption: false,
        })
            previewLimit: number,

        @Option({
            name: 'dry-run',
            describe: 'Is dry run?',
            type: 'boolean',
            alias: 'dr',
            demandOption: false,
        })
            isDryRun: boolean,
    ) {
        const totalFilesCount = await this.fileService.getCount();
        const unusedFilesIds = await this.fileService.getUnusedFilesIds({
            ignoredTables,
            fileNameLike: nameLike,
            isEmpty,
        });
        console.log(`Всего файлов: ${totalFilesCount}`);
        console.log(`Файлов для удаления: ${unusedFilesIds.length}`);

        if (previewLimit && previewLimit > 0) {
            const exampleFiles = await this.fileService.createQuery()
                .where(['in', 'id', unusedFilesIds.slice(0, previewLimit)])
                .many();
            console.table(exampleFiles.map(file => ({
                Title: file.title,
                Size: file.fileSize,
                Created: file.createTime,
                Link: file.url,
            })));
        }

        if (!isDryRun) {
            console.log('Удаление файлов...');
            await Promise.all(unusedFilesIds.map(fileId => this.fileService.remove(fileId, null)));
            console.log('Файлы удалены!');
        } else {
            console.log('Установлен флаг dry run, поэтому удаления файлов не произошло');
        }
    }
}

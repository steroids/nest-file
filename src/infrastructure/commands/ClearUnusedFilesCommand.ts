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
        command: 'junk-files',
        describe: 'Remove junk files',
    })
    async processUnusedFiles(
        @Option({
            name: 'name',
            describe: 'File title query',
            type: 'string',
            alias: 'n',
            demandOption: false,
        })
            nameLike: string,

        @Option({
            name: 'empty',
            describe: 'Files with size = 0',
            type: 'boolean',
            demandOption: false,
        })
            isEmpty: boolean,

        @Option({
            name: 'preview-limit',
            describe: 'Example files limit',
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
            ignoredTables: ['file_image'],
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

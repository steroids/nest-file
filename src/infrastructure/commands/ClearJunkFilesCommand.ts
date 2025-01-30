/* eslint-disable no-console */
import {Command, Option} from 'nestjs-command';
import {Inject, Injectable} from '@nestjs/common';
import {FileService} from '../../domain/services/FileService';

@Injectable()
export class ClearJunkFilesCommand {
    constructor(
        @Inject(FileService)
        private fileService: FileService,
    ) {
    }

    @Command({
        command: 'junk-files',
        describe: 'Remove junk files',
    })
    async junkFiles(
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
            name: 'count',
            describe: 'Count of example files',
            type: 'number',
            alias: 'c',
            demandOption: false,
        })
            exampleCount: number,

        @Option({
            name: 'remove',
            describe: 'Remove files?',
            type: 'boolean',
            alias: 'r',
            demandOption: false,
        })
            isRemove: boolean,
    ) {
        const filesCount = await this.fileService.getCount();
        const filesIds = await this.fileService.getJunkFilesIds({
            ignoredTables: ['file_image'],
            fileNameLike: nameLike,
            isEmpty,
        });
        console.log(`Всего файлов: ${filesCount}`);
        console.log(`Найдено файлов: ${filesIds.length}`);

        if (exampleCount && exampleCount > 0) {
            const exampleFiles = await this.fileService.createQuery()
                .where(['in', 'id', filesIds.slice(0, exampleCount)])
                .many();
            console.table(exampleFiles.map(file => ({
                Title: file.title,
                Size: file.fileSize,
                Created: file.createTime,
                Link: file.url,
            })));
        }

        if (isRemove) {
            await Promise.all(filesIds.map(fileId => this.fileService.remove(fileId, null)));
            console.log('Файлы удалены!');
        }
    }
}

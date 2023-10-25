import {Cron, CronExpression} from '@nestjs/schedule';
import {Injectable} from '@nestjs/common';
import {promises} from 'fs';
import {join} from 'path';
import * as dotenv from 'dotenv';
import {ICrudRepository} from '@steroidsjs/nest/usecases/interfaces/ICrudRepository';
import {IFileImageRepository} from '../../domain/interfaces/IFileImageRepository';
import {IFileRepository} from '../../domain/interfaces/IFileRepository';

dotenv.config();

const REMOVING_FILES_BY_CRON_IS_ENABLE = Boolean(process.env.REMOVING_FILES_BY_CRON_IS_ENABLE);

@Injectable()
export class FileRemoveService {
    constructor(
        private fileRepository: IFileRepository,
        private fileImageRepository: IFileImageRepository,
    ) {}

    @Cron(CronExpression.EVERY_4_HOURS, {
        disabled: !REMOVING_FILES_BY_CRON_IS_ENABLE,
    })
    async removeFilesByCron(): Promise<void> {
        const destinationForUpload = process.env.APP_FILE_STORAGE_ROOT_PATH || join(process.cwd(), '../files/uploaded');
        const fileNamesInDir = await promises.readdir(destinationForUpload);

        const fileNamesInDb = await this.getFileNamesFromDb(fileNamesInDir);

        for (const fileName of fileNamesInDir) {
            if (!fileNamesInDb.includes(fileName)) {
                await promises.rm(join(destinationForUpload, fileName));
            }
        }
    }

    private async getFileNamesFromDb(
        fileNamesInDir: string[],
    ): Promise<string[]> {
        return [
            ...await this.makeQueryToDb(this.fileRepository, fileNamesInDir),
            ...await this.makeQueryToDb(this.fileImageRepository, fileNamesInDir),
        ];
    }

    private async makeQueryToDb<TModel>(
        repository: ICrudRepository<TModel>,
        filesInDir: string[],
    ): Promise<string[]> {
        return repository.createQuery()
            .select('fileName')
            .where(['in', 'fileName', filesInDir])
            .column();
    }
}

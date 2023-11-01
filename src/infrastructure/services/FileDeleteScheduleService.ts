import {Inject, Injectable, OnModuleInit} from '@nestjs/common';
import {IFileService} from '@steroidsjs/nest-modules/file/services/IFileService';
import {SchedulerRegistry} from '@nestjs/schedule';
import {CronJob} from 'cron';
import {FileService} from '../../domain/services/FileService';
import {FileConfigService} from '../../domain/services/FileConfigService';
import {CronJobNames} from '../../domain/enums/CronJobNames';

@Injectable()
export class FileDeleteScheduleService implements OnModuleInit {
    constructor(
        @Inject(IFileService) private fileService: FileService,
        @Inject(FileConfigService) private fileConfigService: FileConfigService,
        @Inject(SchedulerRegistry) private schedulerRegistry: SchedulerRegistry,
    ) {}

    onModuleInit(): void {
        this.deleteFilesByCron();
    }

    deleteFilesByCron(): void {
        const {isEnable, cronTimePattern} = this.fileConfigService.deleteLostAndTemporaryFilesByCron;

        if (!isEnable) {
            return;
        }

        // `any` type used because there is a type error - "Types of property 'cronTime' are incompatible."
        const job = new CronJob(cronTimePattern, () => {
            this.fileService.deleteLostAndTemporaryFiles();
        }) as any;

        this.schedulerRegistry.addCronJob(CronJobNames.deleteLostAndTemporaryFilesJob, job);

        job.start();
    }
}

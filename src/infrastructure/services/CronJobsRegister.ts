import {Inject, Injectable, OnModuleInit} from '@nestjs/common';
import {SchedulerRegistry} from '@nestjs/schedule';
import {CronJob} from 'cron';
import {FileConfigService} from '../../domain/services/FileConfigService';
import {DeleteLostAndTemporaryFilesService} from '../../domain/services/DeleteLostAndTemporaryFilesService';

@Injectable()
export class CronJobsRegister implements OnModuleInit {
    public deleteLostAndTemporaryFilesJobName = 'delete_lost_and_temporary_files_job';

    constructor(
        @Inject(DeleteLostAndTemporaryFilesService) private deleteService: DeleteLostAndTemporaryFilesService,
        @Inject(FileConfigService) private fileConfigService: FileConfigService,
        @Inject(SchedulerRegistry) private schedulerRegistry: SchedulerRegistry,
    ) {}

    onModuleInit(): void {
        this.addCronJobForDeleteFiles();
    }

    addCronJobForDeleteFiles(): void {
        const {isEnable, cronTimePattern} = this.fileConfigService.deleteLostAndTemporaryFilesByCron;

        if (!isEnable) {
            return;
        }

        // `any` type used because there is a type error - "Types of property 'cronTime' are incompatible."
        const job = new CronJob(cronTimePattern, () => {
            this.deleteService.deleteLostAndTemporaryFiles();
        }) as any;

        this.schedulerRegistry.addCronJob(this.deleteLostAndTemporaryFilesJobName, job);

        job.start();
    }
}

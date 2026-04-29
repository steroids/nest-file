import {extname, join} from 'path';
import * as fs from 'fs';
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    UnsupportedMediaTypeException,
    Inject, PayloadTooLargeException,
} from '@nestjs/common';
import {Observable, switchMap, finalize} from 'rxjs';
import * as multer from 'multer';
import {Request} from 'express';
import * as Sentry from '@sentry/node';
import {IFileTypeService} from '../../domain/interfaces/IFileTypeService';
import {FileConfigService} from '../../domain/services/FileConfigService';

// Ключ в объекте request, по которому будет лежать загруженный файл. По-умолчанию декоратор UploadedFile из NestJS ожидает значение file
const FILE_QUERY_KEY = 'file';
type RequestWithOptionalFile = Request & {file?: Express.Multer.File};

@Injectable()
export class TemporaryFileUploadInterceptor implements NestInterceptor {
    constructor(
        @Inject(IFileTypeService)
        private readonly fileTypeService: IFileTypeService,
        @Inject(FileConfigService)
        private readonly fileConfigService: FileConfigService,
    ) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<void>> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<RequestWithOptionalFile>();
        const response = ctx.getResponse();

        const fileType = request.query.fileType as string;

        const config = await this.fileTypeService.getFileUploadOptionsByType(fileType);
        const shouldDeleteTemporaryFile = !this.fileConfigService.saveTemporaryFileAfterUpload;

        const storage = multer.diskStorage({
            // TODO use FileConfigService
            destination: process.env.APP_FILE_STORAGE_ROOT_PATH || join(process.cwd(), '../files/uploaded'),

            filename: (r, file, callback) => {
                const randomName = Array(24).fill(null)
                    .map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return callback(null, `${randomName}${extname(file.originalname)}`);
            },
        });

        const upload = multer({
            storage,
            limits: {fileSize: config.maxSizeMb * 1024 * 1024},
            fileFilter: (req, file, callback: multer.FileFilterCallback) => {
                if (config.mimeTypes?.length && !config.mimeTypes.includes(file.mimetype)) {
                    callback(new UnsupportedMediaTypeException(
                        `Недопустимый тип файла: ${file.mimetype}. Допустимы форматы ${config.mimeTypes.join(', ')}`,
                    ));
                }
                callback(null, true);
            },
        }).single(FILE_QUERY_KEY);

        return new Observable<void>(observer => {
            upload(request, response, err => {
                if (err) {
                    const error = err.code === 'LIMIT_FILE_SIZE'
                        ? new PayloadTooLargeException(`Файл слишком большой. Максимальный размер: ${config.maxSizeMb}MB`)
                        : err;
                    observer.error(error);
                } else {
                    observer.next();
                    observer.complete();
                }
            });
        }).pipe(
            switchMap(() => next.handle()),
            finalize(() => {
                const path = request.file?.path;
                if (shouldDeleteTemporaryFile && path) {
                    fs
                        .promises
                        .rm(path, {force: true})
                        .catch((error) => Sentry.captureException(error, {
                            extra: {
                                scope: 'TemporaryFileUploadInterceptor',
                                path,
                            },
                        }));
                }
            }),
        );
    }
}

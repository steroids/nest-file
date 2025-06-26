import {extname, join} from 'path';
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    UnsupportedMediaTypeException,
    Inject, PayloadTooLargeException,
} from '@nestjs/common';
import {Observable, switchMap} from 'rxjs';
import * as multer from 'multer';
import {Request} from 'express';
import {IFileTypeService} from '../../domain/interfaces/IFileTypeService';

// Ключ в объекте request, по которому будет лежать загруженный файл. По-умолчанию декоратор UploadedFile из NestJS ожидает значение file
const FILE_QUERY_KEY = 'file';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
    constructor(
        @Inject(IFileTypeService)
        private readonly fileTypeService: IFileTypeService,
    ) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<void>> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse();

        const fileType = request.query.fileType as string;

        const config = await this.fileTypeService.getFileUploadOptionsByType(fileType);

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
                if (err.code === 'LIMIT_FILE_SIZE') {
                    observer.error(new PayloadTooLargeException(`Файл слишком большой. Максимальный размер: ${config.maxSizeMb}MB`));
                }
                if (err) {
                    observer.error(err);
                } else {
                    observer.next();
                    observer.complete();
                }
            });
        }).pipe(
            switchMap(() => next.handle()),
        );
    }
}

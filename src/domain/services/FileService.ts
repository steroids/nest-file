import * as fs from 'fs';
import * as mime from 'mime-types';
import {getMimeType} from 'stream-mime-type';
import {DataMapper} from '@steroidsjs/nest/usecases/helpers/DataMapper';
import {ValidationHelper} from '@steroidsjs/nest/usecases/helpers/ValidationHelper';
import {Readable} from 'stream';
import {generateUid} from '@steroidsjs/nest/infrastructure/decorators/fields/UidField';
import {IValidator} from '@steroidsjs/nest/usecases/interfaces/IValidator';
import {ReadService} from '@steroidsjs/nest/usecases/services/ReadService';
import SearchQuery from '@steroidsjs/nest/usecases/base/SearchQuery';
import {Type} from '@nestjs/common';
import {toInteger as _toInteger} from 'lodash';
import * as Sentry from '@sentry/node';
import {ContextDto} from '@steroidsjs/nest/usecases/dtos/ContextDto';
import {IFileRepository} from '../interfaces/IFileRepository';
import {FileModel} from '../models/FileModel';
import {FileImageService} from './FileImageService';
import {FileUploadOptions} from '../dtos/FileUploadOptions';
import {FileSaveDto} from '../dtos/FileSaveDto';
import {FileConfigService} from './FileConfigService';
import {FileStorageFabric} from './FileStorageFabric';
import {FileExpressSourceDto} from '../dtos/sources/FileExpressSourceDto';
import {FileLocalSourceDto} from '../dtos/sources/FileLocalSourceDto';
import {FileStreamSourceDto} from '../dtos/sources/FileStreamSourceDto';
import {IFilePreviewOptions} from '../interfaces/IFilePreviewOptions';

export class FileService extends ReadService<FileModel> {
    constructor(
        public repository: IFileRepository,
        protected fileImageService: FileImageService,
        protected fileConfigService: FileConfigService,
        protected fileStorageFabric: FileStorageFabric,
        public validators: IValidator[],
    ) {
        super();
    }

    async read(model: FileModel): Promise<Buffer> {
        const storage = this.fileStorageFabric.get(model.storageName);
        return storage.read(model);
    }

    async upload<T>(
        rawOptions: string | FileExpressSourceDto | FileLocalSourceDto | FileStreamSourceDto | FileUploadOptions,
        schemaClass: T = null,
    ): Promise<T | FileModel> {
        const fileModel = await this.uploadFileInternal(rawOptions);
        await this.createPreviewsOnImage(fileModel, this.fileConfigService.previews);
        return schemaClass ? DataMapper.create(schemaClass, fileModel) : fileModel;
    }

    async uploadImage<T>(
        rawOptions: string | FileExpressSourceDto | FileLocalSourceDto | FileStreamSourceDto | FileUploadOptions,
        customPreviews: Record<string, IFilePreviewOptions> = null,
        schemaClass: T = null,
    ): Promise<T | FileModel> {
        const fileModel = await this.uploadFileInternal(rawOptions);
        await this.createPreviewsOnImage(fileModel, customPreviews || this.fileConfigService.previews);
        return schemaClass ? DataMapper.create(schemaClass, fileModel) : fileModel;
    }

    protected async uploadFileInternal(
        rawOptions: string | FileExpressSourceDto | FileLocalSourceDto | FileStreamSourceDto | FileUploadOptions,
    ): Promise<FileModel> {
        // Resolve options
        if (typeof rawOptions === 'string') {
            rawOptions = FileLocalSourceDto.createFromPath(rawOptions);
        }

        const options: FileUploadOptions = rawOptions instanceof FileExpressSourceDto
        || rawOptions instanceof FileLocalSourceDto || rawOptions instanceof FileStreamSourceDto
            ? DataMapper.create(FileUploadOptions, {source: rawOptions})
            : rawOptions as FileUploadOptions;

        // Resolve storage name
        if (!options.storageName) {
            options.storageName = this.fileConfigService.defaultStorageName;
        }

        // Create FileModel from source
        const firstUid = [].concat(options.uids || [])?.[0];

        const fileDto = await this.createDtoFromSource(options.source, firstUid);
        if (options.folder) {
            fileDto.folder = options.folder;
        }
        if (options.title) {
            fileDto.title = options.title;
        }

        // Validate
        if (options.imagesOnly) {
            options.mimeTypes = this.fileConfigService.imagesMimeTypes;
        }
        if (!options.maxSizeMb) {
            options.maxSizeMb = this.fileConfigService.fileMaxSizeMb;
        }
        await ValidationHelper.validate(fileDto, {params: options as any}, this.validators);

        // Get file stream from source
        const stream = await this.createStreamFromSource(options.source);

        // Remove source
        if (!(options.source instanceof FileStreamSourceDto) && !process.env.SAVE_SOURCE_FILE_AFTER_UPLOAD) {
            await this.removeSource(options.source);
        }

        // Save original file via storage
        const writeResult = await this.fileStorageFabric.get(options.storageName).write(fileDto, stream);

        // Save file in database
        return this.repository.create(DataMapper.create(FileModel, {
            ...fileDto,
            fileMimeType: fileDto.fileMimeType || '',
            md5: fileDto.md5 || writeResult.md5,
            storageName: options.storageName,
        }));
    }

    protected async createPreviewsOnImage(fileModel: FileModel, previews: Record<string, IFilePreviewOptions>) {
        // Create previews for image
        if (this.fileConfigService.imagesMimeTypes.includes(fileModel.fileMimeType)) {
            fileModel.images = [];
            for (const previewName of Object.keys(previews)) {
                const preview = previews[previewName];
                if (preview?.enable) {
                    try {
                        fileModel.images.push(
                            await this.fileImageService.createPreview(fileModel, previewName, preview),
                        );
                    } catch (e) {
                        Sentry.captureException(e, {
                            extra: {
                                scope: 'FileService',
                                fileModelId: fileModel.id,
                            },
                        });
                    }
                }
            }
        }
    }

    /**
     * Convert any sources to stream and return it
     * @param source
     * @protected
     */
    protected async createStreamFromSource(
        source: FileExpressSourceDto | FileLocalSourceDto | FileStreamSourceDto,
    ): Promise<Readable | Buffer> {
        if (source instanceof FileExpressSourceDto || source instanceof FileLocalSourceDto) {
            // Check file exists
            try {
                await fs.promises.access(source.path, fs.constants.F_OK);
            } catch (e) {
                throw new Error('Файл не найден: ' + source.path);
            }

            if (source instanceof FileExpressSourceDto) {
                return fs.promises.readFile(source.path);
            }
            return fs.createReadStream(source.path, 'utf8');
        }

        return source.stream;
    }

    /**
     * Create FileSaveDto from upload source
     * @param source
     * @param uid
     * @protected
     */
    protected async createDtoFromSource(
        source: FileExpressSourceDto | FileLocalSourceDto | FileStreamSourceDto,
        uid: string = null,
    ): Promise<FileSaveDto> {
        const dto = DataMapper.create(FileSaveDto, {
            uid: uid || generateUid(),
            fileMimeType: '',
        });

        if (source instanceof FileExpressSourceDto) {
            dto.title = source.originalname;
            dto.fileSize = source.size;
            dto.fileMimeType = source.mimetype;
        }

        if (source instanceof FileLocalSourceDto || source instanceof FileStreamSourceDto) {
            dto.title = source.fileName || null;
            dto.fileSize = source.fileSize || null;
            dto.fileMimeType = source.fileMimeType || null;
            dto.md5 = source.md5 || null;

            if (source instanceof FileStreamSourceDto && source.stream instanceof Buffer) {
                dto.fileSize = source.stream.length;
            }
        }

        // Auto get file size, if no exists
        if (!dto.fileSize && (source instanceof FileExpressSourceDto || source instanceof FileLocalSourceDto)) {
            dto.fileSize = (await fs.promises.stat(source.path)).size;
        }

        // Auto get mime type, if no exists
        if (!dto.fileSize && (source instanceof FileExpressSourceDto || source instanceof FileLocalSourceDto)) {
            dto.mimeType = mime.lookup('.' + source.path.split('.').pop());
        } else if (source instanceof FileStreamSourceDto && source.stream instanceof Readable) {
            dto.mimeType = await getMimeType(source.stream, {
                filename: dto.fileName,
            });
        }

        // Generate file name by uid and extension
        const extension = (dto.title || '').split('.').pop()
            || (dto.fileMimeType ? mime.extension(dto.fileMimeType) : '');
        dto.fileName = extension ? `${dto.uid}.${extension}` : dto.uid;
        if (extension && !dto.fileMimeType) {
            dto.fileMimeType = mime.lookup(extension);
        }

        return dto;
    }

    async findById(id: number | string, context?: ContextDto | null): Promise<FileModel>

    async findById<TSchema>(
        id: number | string,
        context?: ContextDto | null,
        schemaClass?: Type<TSchema>,
    ): Promise<Type<TSchema>>

    async findById<TSchema>(
        rawId: number | string,
        context?: ContextDto | null,
        schemaClass?: Type<TSchema>,
    ): Promise<FileModel | Type<TSchema>> {
        const id = _toInteger(rawId);
        const model = await this.repository.findOne(
            (new SearchQuery<FileModel>()).where({id}),
        );
        return schemaClass ? DataMapper.create(schemaClass, model) : model;
    }

    async getFileWithDocument(fileName: string) {
        return this.repository.getFileWithDocument(fileName);
    }

    private async removeSource(source: FileExpressSourceDto | FileLocalSourceDto): Promise<void> {
        try {
            await fs.promises.rm(source.path);
        } catch (error) {
            Sentry.captureException(error, {
                extra: {
                    scope: 'FileService',
                    pathToFile: source.path,
                },
            });
        }
    }
}

import * as sharp from 'sharp';
import {DataMapper} from '@steroidsjs/nest/usecases/helpers/DataMapper';
import {ContextDto} from '@steroidsjs/nest/usecases/dtos/ContextDto';
import {IFileImageRepository} from '../interfaces/IFileImageRepository';
import {FileImageModel} from '../models/FileImageModel';
import {FileConfigService} from './FileConfigService';
import {FileModel} from '../models/FileModel';
import {FileHelper} from '../helpers/FileHelper';
import FilePreviewEnum from '../enums/FilePreviewEnum';
import {FileSaveDto} from '../dtos/FileSaveDto';
import {SharpHelper} from '../helpers/SharpHelper';
import {IFilePreviewOptions} from '../interfaces/IFilePreviewOptions';
import {FileRemovedEventDto} from '../dtos/events/FileRemovedEventDto';
import {IEventEmitter} from '../interfaces/IEventEmitter';
import { IFileStorageFactory } from '../interfaces/IFileStorageFactory';
import FileStorageEnum from '../enums/FileStorageEnum';

const SVG_MIME_TYPE = 'image/svg+xml';

export class FileImageService {
    constructor(
        public repository: IFileImageRepository,
        protected readonly fileConfigService: FileConfigService,
        protected readonly fileStorageFactory: IFileStorageFactory,
        protected readonly eventEmitter: IEventEmitter,
    ) {
    }

    async createPreview(file: FileModel, previewName: string, previewOptions: IFilePreviewOptions = null): Promise<FileImageModel> {
        const isSvg = file.fileMimeType === SVG_MIME_TYPE;

        if (isSvg) {
            const imageModel = DataMapper.create<FileImageModel>(FileImageModel, {
                fileId: file.id,
                fileName: file.fileName,
                folder: file.folder,
                fileMimeType: file.fileMimeType,
                storageName: file.storageName,
                fileSize: file.fileSize,
                width: null,
                height: null,
                previewName,
                isOriginal: previewName === FilePreviewEnum.ORIGINAL,
            });

            return this.repository.create(imageModel);
        }

        if (!previewOptions) {
            previewOptions = this.fileConfigService.previews?.[previewName];
        }

        const content = await this.fileStorageFactory.get(file.storageName).read(file);

        const image = sharp(content, {failOnError: false});
        const imageMetadata = await image.metadata();
        let imageWidth: number;
        let imageHeight: number;

        if (previewOptions?.rotate) {
            // base on EXIF
            image.autoOrient();
            imageWidth = imageMetadata.autoOrient.width;
            imageHeight = imageMetadata.autoOrient.height;
        } else {
            // not base on EXIF
            imageWidth = imageMetadata.width;
            imageHeight = imageMetadata.height;
        }

        let hasChanges = false;

        const isNeedResize = previewOptions?.width && previewOptions?.height;
        const isNeedStretch = imageWidth < previewOptions.width || imageHeight < previewOptions.height;
        const isAllowStretch = previewOptions?.stretch;

        if (isNeedResize && (!isNeedStretch || isAllowStretch)) {
            image.resize(previewOptions.width, previewOptions.height, previewOptions.sharp?.resize);
            hasChanges = true;
        }

        if (previewOptions?.sharp?.extend) {
            image.extend(previewOptions.sharp.extend);
            hasChanges = true;
        }
        if (previewOptions?.sharp?.extract) {
            image.extract(previewOptions.sharp.extract);
            hasChanges = true;
        }

        //add image output options if they are specified
        const sharpOptionName = SharpHelper.getImageOptionNameByMimeType(file.fileMimeType);

        if (sharpOptionName && previewOptions.sharp?.outputImageOptions?.[sharpOptionName]) {
            image[sharpOptionName](previewOptions.sharp?.outputImageOptions[sharpOptionName]);
        }

        const {data, info} = await image.toBuffer({resolveWithObject: true});

        const imageModel = DataMapper.create<FileImageModel>(FileImageModel, {
            fileId: file.id,
            fileName: hasChanges
                ? FileHelper.addPreviewSuffix(file.fileName, previewName)
                : file.fileName,
            folder: file.folder,
            fileMimeType: file.fileMimeType,
            storageName: file.storageName,
            fileSize: info.size,
            width: info.width,
            height: info.height,
            previewName,
            isOriginal: previewName === FilePreviewEnum.ORIGINAL,
        });

        if (hasChanges) {
            await this.fileStorageFactory.get(file.storageName).write(
                DataMapper.create<FileSaveDto>(FileSaveDto, {
                    uid: file.uid,
                    folder: imageModel.folder,
                    fileName: imageModel.fileName,
                    fileMimeType: file.fileMimeType,
                }),
                data,
            );
        }

        return this.repository.create(imageModel);
    }

    async getFilesPathsFromDb(storageName: FileStorageEnum): Promise<string[] | null> {
        return this.repository.getFilesPathsByStorageName(storageName);
    }

    public async remove(id: number, context: ContextDto) {
        const fileImage = await this.repository.createQuery()
            .where({id})
            .one();

        await this.repository.remove(id);

        this.eventEmitter.emit(FileRemovedEventDto.eventName, DataMapper.create(FileRemovedEventDto, {
            fileId: fileImage.id,
            folder: fileImage.folder,
            fileName: fileImage.fileName,
            storageName: fileImage.storageName,
        }));
    }
}

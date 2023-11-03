import * as sharp from 'sharp';
import {DataMapper} from '@steroidsjs/nest/usecases/helpers/DataMapper';
import {IFileImageRepository} from '../interfaces/IFileImageRepository';
import {FileImageModel} from '../models/FileImageModel';
import {FileConfigService} from './FileConfigService';
import {FileStorageFabric} from './FileStorageFabric';
import {FileModel} from '../models/FileModel';
import {FileHelper} from '../helpers/FileHelper';
import FilePreviewEnum from '../enums/FilePreviewEnum';
import {FileSaveDto} from '../dtos/FileSaveDto';
import {SharpHelper} from '../helpers/SharpHelper';
import {IFilePreviewOptions} from '../interfaces/IFilePreviewOptions';
import {FileStorage} from '../enums/FileStorageEnum';

export class FileImageService {
    constructor(
        public repository: IFileImageRepository,
        protected readonly fileConfigService: FileConfigService,
        protected readonly fileStorageFabric: FileStorageFabric,
    ) {
    }

    async createPreview(file: FileModel, previewName: string, previewOptions: IFilePreviewOptions = null): Promise<FileImageModel> {
        if (!previewOptions) {
            previewOptions = this.fileConfigService.previews?.[previewName];
        }

        const content = await this.fileStorageFabric.get(file.storageName).read(file);

        const image = sharp(content, {failOnError: false});
        let hasChanges = false;
        if (previewOptions?.width && previewOptions?.height) {
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
            await this.fileStorageFabric.get(file.storageName).write(
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

    async getFileNamesFromDb(storageName: FileStorage): Promise<string[] | null> {
        return this.repository.getFileNamesByStorageName(storageName);
    }
}

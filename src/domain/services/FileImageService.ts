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

export class FileImageService {
    constructor(
        public repository: IFileImageRepository,
        private fileConfigService: FileConfigService,
        private fileStorageFabric: FileStorageFabric,
    ) {
    }

    async createPreview(file: FileModel, previewName: string): Promise<FileImageModel> {
        const preview = this.fileConfigService.previews?.[previewName];
        const content = await this.fileStorageFabric.get(file.storageName).read(file);

        const image = sharp(content, {failOnError: false});
        let hasChanges = false;
        if (preview?.width && preview?.height) {
            image.resize(preview.width, preview.height, preview.sharp?.resize);
            hasChanges = true;
        }
        if (preview?.sharp?.extend) {
            image.extend(preview.sharp.extend);
            hasChanges = true;
        }
        const {data, info} = await image
            //параметры добавлены исключительно для уменьшения веса превью
            .png({
                quality: 80,
                palette: true,
            })
            .jpeg({
                quality: 60,
            })
            .toBuffer({resolveWithObject: true});

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
}

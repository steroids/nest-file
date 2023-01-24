import {ExtendField} from '@steroidsjs/nest/infrastructure/decorators/fields/ExtendField';
import {Computable} from '@steroidsjs/nest/infrastructure/decorators/Computable';
import {IntegerField, StringField} from '@steroidsjs/nest/infrastructure/decorators/fields';
import {FileModel} from '../../domain/models/FileModel';
import FilePreviewEnum from '../../domain/enums/FilePreviewEnum';
import {FileImageItemSchema} from './FileImageItemSchema';

const getImageKey = (item, preview, key) => item.images?.find(image => image.previewName === preview)?.[key] || null;

export class FileImageSchema {
    @ExtendField(FileModel)
    id: number;

    @ExtendField(FileModel)
    uid: string;

    @ExtendField(FileModel)
    title: string;

    @ExtendField(FileModel)
    url: string;

    @ExtendField(FileModel, {
        sourceFieldName: 'fileSize',
    })
    size: number;

    @ExtendField(FileModel)
    createTime: string;

    @StringField()
    @Computable(({item}) => getImageKey(item, FilePreviewEnum.ORIGINAL, 'url'))
    fullUrl: string;

    @IntegerField()
    @Computable(({item}) => getImageKey(item, FilePreviewEnum.ORIGINAL, 'width'))
    fullWidth: number;

    @IntegerField()
    @Computable(({item}) => getImageKey(item, FilePreviewEnum.ORIGINAL, 'height'))
    fullHeight: number;

    @StringField()
    @Computable(({item}) => getImageKey(item, FilePreviewEnum.THUMBNAIL, 'url'))
    thumbnailUrl: string;

    @IntegerField()
    @Computable(({item}) => getImageKey(item, FilePreviewEnum.THUMBNAIL, 'width'))
    thumbnailWidth: number;

    @IntegerField()
    @Computable(({item}) => getImageKey(item, FilePreviewEnum.THUMBNAIL, 'height'))
    thumbnailHeight: number;

    @ExtendField(FileModel, {
        sourceFieldName: 'images',
        relationClass: () => FileImageItemSchema,
    })
    images: FileImageItemSchema[];
}

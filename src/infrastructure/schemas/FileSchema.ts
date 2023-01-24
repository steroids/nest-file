import {ExtendField} from '@steroidsjs/nest/infrastructure/decorators/fields/ExtendField';
import {FileModel} from '../../domain/models/FileModel';

export class FileSchema {
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
}

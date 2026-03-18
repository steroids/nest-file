import {IntegerField, StringField} from '@steroidsjs/nest/infrastructure/decorators/fields';
import {FileStorageNameType} from '../../types/FileStorageNameType';

export class FileRemovedEventDto {
    static eventName = Symbol('File.Removed');

    @IntegerField()
    fileId: number;

    @StringField()
    folder: string;

    @StringField()
    fileName: string;

    @StringField()
    storageName: FileStorageNameType;
}

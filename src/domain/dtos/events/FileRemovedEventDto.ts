import { EnumField, IntegerField, StringField } from '@steroidsjs/nest/infrastructure/decorators/fields';
import FileStorageEnum from '../../enums/FileStorageEnum';

export class FileRemovedEventDto {
    static eventName = Symbol('File.Removed');

    @IntegerField()
    fileId: number;

    @StringField()
    folder: string;

    @StringField()
    fileName: string;

    @EnumField({
        enum: FileStorageEnum,
    })
    storageName: FileStorageEnum;
}

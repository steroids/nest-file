import {IntegerField, StringField} from '@steroidsjs/nest/infrastructure/decorators/fields';

export class FileRemovedEventDto {
    static eventName = Symbol('File.Removed');

    @IntegerField()
    fileId: number;

    @StringField()
    folder: string;

    @StringField()
    fileName: string;

    @StringField()
    storageName: string;
}

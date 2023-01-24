import {Readable} from 'stream';
import {IntegerField, StringField} from '@steroidsjs/nest/infrastructure/decorators/fields';

export class FileStreamSourceDto {
    @StringField({
        label: 'Name of this file within `destination`',
    })
    fileName: string;

    @IntegerField({
        label: 'Size of the file in bytes',
    })
    fileSize: number;

    @StringField({
        label: 'Value of the `Content-Type` header for this file',
    })
    fileMimeType: string;

    @StringField({
        label: 'A md5 file hash',
    })
    md5: string;

    @StringField({
        label: 'A readable stream of this file',
    })
    stream: Readable | Buffer;
}

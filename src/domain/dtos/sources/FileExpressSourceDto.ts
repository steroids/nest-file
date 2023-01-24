import {Readable} from 'stream';
import {IntegerField, StringField} from '@steroidsjs/nest/infrastructure/decorators/fields';
import {Express} from 'express';

export class FileExpressSourceDto implements Omit<Express.Multer.File, 'encoding'> {
    @StringField({
        label: 'Name of the form field associated with this file',
    })
    fieldname: string;

    @StringField({
        label: 'Name of the file on the uploader\'s computer',
    })
    originalname: string;

    @StringField({
        label: 'Value of the `Content-Type` header for this file',
    })
    mimetype: string;

    @IntegerField({
        label: 'Size of the file in bytes',
    })
    size: number;

    @StringField({
        label: 'A readable stream of this file',
    })
    stream: Readable;

    @StringField({
        label: '`DiskStorage` only: Directory to which this file has been uploaded',
    })
    destination: string;

    @StringField({
        label: '`DiskStorage` only: Name of this file within `destination`',
    })
    filename: string;

    @StringField({
        label: '`DiskStorage` only: Full path to the uploaded file',
    })
    path: string;

    @StringField({
        label: '`MemoryStorage` only: A Buffer containing the entire file',
    })
    buffer: Buffer;
}

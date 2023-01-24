import {IntegerField, StringField} from '@steroidsjs/nest/infrastructure/decorators/fields';
import {DataMapper} from '@steroidsjs/nest/usecases/helpers/DataMapper';

export class FileLocalSourceDto {
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
        label: 'Absolute path to file on disk',
    })
    path: string;

    @StringField({
        label: 'A md5 file hash',
    })
    md5: string;

    static createFromPath(path) {
        return DataMapper.create(FileLocalSourceDto, {
            // TODO fileName
            // TODO fileSize
            // TODO fileMimeType
            path,
        });
    }
}

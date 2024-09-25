import {ExtendField} from '@steroidsjs/nest/infrastructure/decorators/fields/ExtendField';
import {Validator} from '@steroidsjs/nest/usecases/validators';
import {FileModel} from '../models/FileModel';
import {FileMimeTypesValidator} from '../validators/FileMimeTypesValidator';
import {FileMaxSizeValidator} from '../validators/FileMaxSizeValidator';

export class FileSaveDto {
    @ExtendField(FileModel)
    uid: string;

    @ExtendField(FileModel)
    title: string;

    @ExtendField(FileModel)
    fileName: string;

    @ExtendField(FileModel)
    @Validator(FileMaxSizeValidator)
    fileSize: number;

    @ExtendField(FileModel)
    @Validator(FileMimeTypesValidator)
    fileMimeType: string;

    @ExtendField(FileModel)
    folder: string;

    @ExtendField(FileModel)
    md5: string;
}

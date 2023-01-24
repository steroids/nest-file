import * as mime from 'mime-types';
import {IValidator, IValidatorParams} from '@steroidsjs/nest/usecases/interfaces/IValidator';
import {FieldValidatorException} from '@steroidsjs/nest/usecases/exceptions/FieldValidatorException';
import {FileUploadOptions} from '../dtos/FileUploadOptions';
import {FileSaveDto} from '../dtos/FileSaveDto';

export class FileMimeTypesValidator implements IValidator {
    async validate(dto: FileSaveDto, params: IValidatorParams) {
        const options = params.params as FileUploadOptions;

        if (options.mimeTypes && !options.mimeTypes.includes(dto[params.name])) {
            const availableExtensions = options.mimeTypes
                .map(mimeType => mime.extension(mimeType))
                .join(', ');
            throw new FieldValidatorException('Неверный формат файла, доступные: ' + availableExtensions);
        }
    }
}

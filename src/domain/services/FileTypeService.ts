import {DataMapper} from '@steroidsjs/nest/usecases/helpers/DataMapper';
import {FileUploadOptions} from '../dtos/FileUploadOptions';

/*
    Basic implementation of a service that, based on the fileType field, sets the necessary parameters for
    this type of file - their maximum size, format, directory, etc.
    You can override this service in your project with your own implementation.
 */
export class FileTypeService {
    constructor() {}

    public async getFileUploadOptionsByType(fileType: string) {
        return DataMapper.create(FileUploadOptions, {
            folder: null,
            maxSizeMb: null,
            mimeTypes: null,
        });
    }
}

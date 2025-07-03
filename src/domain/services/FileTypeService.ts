import {DataMapper} from '@steroidsjs/nest/usecases/helpers/DataMapper';
import {FileUploadOptions} from '../dtos/FileUploadOptions';
import {IFileTypeService} from '../interfaces/IFileTypeService';

const DEFAULT_FILE_MAX_SIZE_MB = 10;

/*
    Basic implementation of a service that, based on the fileType field, sets the necessary parameters for
    this type of file - their maximum size, format, directory, etc.
    You can override this service in your project with your own implementation.
 */
export class FileTypeService implements IFileTypeService {
    constructor() {}

    public async getFileUploadOptionsByType(fileType: string) {
        return DataMapper.create<FileUploadOptions>(FileUploadOptions, {
            folder: null,
            maxSizeMb: DEFAULT_FILE_MAX_SIZE_MB,
            mimeTypes: [],
        } as object);
    }
}

import { DataMapper } from '@steroidsjs/nest/usecases/helpers/DataMapper';
import { FileUploadOptions } from '../dtos/FileUploadOptions';

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

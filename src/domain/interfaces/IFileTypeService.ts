import {FileUploadOptions} from '../dtos/FileUploadOptions';

export const IFileTypeService = 'IFIleTypeService';

export interface IFileTypeService {
    getFileUploadOptionsByType: (fileType: string) => Promise<FileUploadOptions>;
}

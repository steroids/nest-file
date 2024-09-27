import {FileUploadOptions} from '../dtos/FileUploadOptions';

export const IFIleTypeService = 'IFIleTypeService';

export interface IFIleTypeService {
    getFileUploadOptionsByType: (fileType: string) => Promise<FileUploadOptions>;
}

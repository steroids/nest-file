import {FileModel} from '../models/FileModel';
import {FileImageModel} from '../models/FileImageModel';

export interface IImageDownloadObject {
    fileModel: FileModel,
    originalImageModel: FileImageModel,
    thumbnailImageModel: FileImageModel,
}
